from rest_framework import serializers
from .models import (Account, JournalEntry, JournalEntryLine, AccountingPeriod, 
                     Invoice, InvoiceLine, Budget, BudgetLine)


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'code', 'name', 'account_type', 'description', 'parent', 
                  'is_active', 'balance', 'balance_currency', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class JournalEntryLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = JournalEntryLine
        fields = ['id', 'journal_entry', 'account', 'account_code', 'account_name', 
                  'description', 'debit_amount', 'debit_amount_currency', 
                  'credit_amount', 'credit_amount_currency', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalEntryLineSerializer(many=True, read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True)
    posted_by_email = serializers.EmailField(source='posted_by.email', read_only=True)

    class Meta:
        model = JournalEntry
        fields = ['id', 'entry_number', 'date', 'description', 'status', 'posted_at', 
                  'posted_by', 'posted_by_email', 'period', 'period_name', 'lines', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'posted_at']


class AccountingPeriodSerializer(serializers.ModelSerializer):
    closed_by_email = serializers.EmailField(source='closed_by.email', read_only=True)

    class Meta:
        model = AccountingPeriod
        fields = ['id', 'name', 'start_date', 'end_date', 'is_closed', 'closed_at', 
                  'closed_by', 'closed_by_email', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'closed_at']


class InvoiceLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.code', read_only=True)

    class Meta:
        model = InvoiceLine
        fields = ['id', 'invoice', 'product', 'product_name', 'product_code', 
                  'description', 'quantity', 'unit_price', 'unit_price_currency', 
                  'line_total', 'line_total_currency', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'line_total']


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'customer', 'customer_name', 'date', 'due_date', 
                  'status', 'subtotal', 'subtotal_currency', 'tax_amount', 'tax_amount_currency', 
                  'total_amount', 'total_amount_currency', 'notes', 'posted', 'posted_at', 
                  'lines', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'posted_at']


class BudgetLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = BudgetLine
        fields = ['id', 'budget', 'account', 'account_code', 'account_name', 
                  'amount', 'amount_currency', 'notes', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class BudgetSerializer(serializers.ModelSerializer):
    lines = BudgetLineSerializer(many=True, read_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'name', 'fiscal_year', 'status', 'start_date', 'end_date', 
                  'total_budget', 'total_budget_currency', 'notes', 'lines', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']
