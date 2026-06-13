from django.contrib import admin
from .models import (Account, JournalEntry, JournalEntryLine, AccountingPeriod, 
                     Invoice, InvoiceLine, Budget, BudgetLine)


class JournalEntryLineInline(admin.TabularInline):
    model = JournalEntryLine
    extra = 1


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'account_type', 'is_active', 'balance']
    list_filter = ['account_type', 'is_active']
    search_fields = ['code', 'name']


@admin.register(AccountingPeriod)
class AccountingPeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'is_closed']
    list_filter = ['is_closed', 'start_date']
    search_fields = ['name']


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ['entry_number', 'date', 'status', 'period']
    list_filter = ['status', 'date', 'period']
    search_fields = ['entry_number', 'description']
    inlines = [JournalEntryLineInline]
    readonly_fields = ['posted_at']


class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'customer', 'date', 'due_date', 'status', 'total_amount']
    list_filter = ['status', 'date']
    search_fields = ['invoice_number', 'customer__name']
    inlines = [InvoiceLineInline]
    readonly_fields = ['posted_at']


class BudgetLineInline(admin.TabularInline):
    model = BudgetLine
    extra = 1


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['name', 'fiscal_year', 'status', 'total_budget']
    list_filter = ['status', 'fiscal_year']
    search_fields = ['name']
    inlines = [BudgetLineInline]
