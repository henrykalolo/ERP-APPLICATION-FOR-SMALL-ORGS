from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from apps.core.views import BaseModelViewSet
from .models import (Account, JournalEntry, JournalEntryLine, AccountingPeriod, 
                     Invoice, InvoiceLine, Budget, BudgetLine)
from .serializers import (AccountSerializer, JournalEntrySerializer, JournalEntryLineSerializer,
                          AccountingPeriodSerializer, InvoiceSerializer, InvoiceLineSerializer,
                          BudgetSerializer, BudgetLineSerializer)


class AccountViewSet(BaseModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        account_type = self.request.query_params.get('account_type')
        is_active = self.request.query_params.get('is_active')
        
        if account_type:
            queryset = queryset.filter(account_type=account_type)
        if is_active:
            queryset = queryset.filter(is_active=is_active == 'true')
            
        return queryset


class AccountingPeriodViewSet(BaseModelViewSet):
    queryset = AccountingPeriod.objects.all()
    serializer_class = AccountingPeriodSerializer

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        period = self.get_object()
        if period.is_closed:
            return Response({'error': 'Period is already closed'}, status=status.HTTP_400_BAD_REQUEST)
        
        period.is_closed = True
        period.closed_at = timezone.now()
        period.closed_by = request.user
        period.save()
        
        return Response({'message': 'Accounting period closed successfully'})


class JournalEntryViewSet(BaseModelViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        period = self.request.query_params.get('period')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if period:
            queryset = queryset.filter(period_id=period)
            
        return queryset.select_related('period', 'posted_by').prefetch_related('lines')

    @action(detail=True, methods=['post'])
    def post(self, request, pk=None):
        journal_entry = self.get_object()
        try:
            journal_entry.post()
            return Response({'message': 'Journal entry posted successfully'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def ledger(self, request):
        queryset = JournalEntryLine.objects.filter(
            journal_entry__status='posted',
            tenant=request.tenant
        ).select_related('journal_entry', 'account').order_by('journal_entry__date', 'journal_entry__entry_number')

        account = request.query_params.get('account')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if account:
            queryset = queryset.filter(account_id=account)
        if date_from:
            queryset = queryset.filter(journal_entry__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(journal_entry__date__lte=date_to)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = JournalEntryLineSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = JournalEntryLineSerializer(queryset, many=True)
        return Response(serializer.data)


class InvoiceViewSet(BaseModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        customer = self.request.query_params.get('customer')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if customer:
            queryset = queryset.filter(customer_id=customer)
            
        return queryset.select_related('customer').prefetch_related('lines')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status not in ['draft', 'sent']:
            return Response({'error': 'Only draft or sent invoices can be approved'}, status=status.HTTP_400_BAD_REQUEST)

        invoice.status = 'sent'
        invoice.save()
        return Response({'message': 'Invoice approved successfully'})

    @action(detail=True, methods=['post'])
    def calculate(self, request, pk=None):
        invoice = self.get_object()
        invoice.calculate_totals()
        return Response({'message': 'Invoice totals calculated', 'subtotal': str(invoice.subtotal), 
                       'tax_amount': str(invoice.tax_amount), 'total_amount': str(invoice.total_amount)})

    @action(detail=True, methods=['post'])
    def post_to_ledger(self, request, pk=None):
        invoice = self.get_object()
        if invoice.posted:
            return Response({'error': 'Invoice already posted'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            period = AccountingPeriod.objects.filter(
                tenant=request.tenant,
                start_date__lte=invoice.date,
                end_date__gte=invoice.date,
                is_closed=False
            ).first()
            
            if not period:
                raise ValueError('No active accounting period found')
            
            journal_entry = JournalEntry.objects.create(
                entry_number=f"INV-{invoice.invoice_number}",
                date=invoice.date,
                description=f"Invoice {invoice.invoice_number} - {invoice.customer.name}",
                period=period,
                tenant=request.tenant,
                created_by=request.user
            )
            
            receivable_account = Account.objects.filter(
                tenant=request.tenant,
                account_type='asset',
                code__icontains='receivable'
            ).first()
            
            if receivable_account:
                JournalEntryLine.objects.create(
                    journal_entry=journal_entry,
                    account=receivable_account,
                    description=f"Invoice {invoice.invoice_number}",
                    debit_amount=invoice.total_amount,
                    credit_amount=0,
                    tenant=request.tenant
                )
            
            revenue_account = Account.objects.filter(
                tenant=request.tenant,
                account_type='revenue'
            ).first()
            
            if revenue_account:
                JournalEntryLine.objects.create(
                    journal_entry=journal_entry,
                    account=revenue_account,
                    description=f"Invoice {invoice.invoice_number}",
                    debit_amount=0,
                    credit_amount=invoice.subtotal,
                    tenant=request.tenant
                )
            
            vat_account = Account.objects.filter(
                tenant=request.tenant,
                account_type='liability',
                code__icontains='vat'
            ).first()
            
            if vat_account:
                JournalEntryLine.objects.create(
                    journal_entry=journal_entry,
                    account=vat_account,
                    description=f"VAT on Invoice {invoice.invoice_number}",
                    debit_amount=0,
                    credit_amount=invoice.tax_amount,
                    tenant=request.tenant
                )
            
            invoice.posted = True
            invoice.posted_at = timezone.now()
            invoice.save()
        
        return Response({'message': 'Invoice posted to ledger successfully', 'journal_entry_id': journal_entry.id})


class BudgetViewSet(BaseModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        fiscal_year = self.request.query_params.get('fiscal_year')
        status_filter = self.request.query_params.get('status')
        
        if fiscal_year:
            queryset = queryset.filter(fiscal_year=fiscal_year)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.prefetch_related('lines')
