from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from apps.core.models import TenantScopedModel
from djmoney.models.fields import MoneyField


class Account(TenantScopedModel):
    ACCOUNT_TYPES = [
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('revenue', 'Revenue'),
        ('expense', 'Expense'),
    ]

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True)
    balance = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK', default=0)

    class Meta:
        ordering = ['code']
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'

    def __str__(self):
        return f"{self.code} - {self.name}"


class JournalEntry(TenantScopedModel):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('posted', 'Posted'),
        ('cancelled', 'Cancelled'),
    ]

    entry_number = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    posted_at = models.DateTimeField(null=True, blank=True)
    posted_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_journal_entries'
    )
    period = models.ForeignKey('AccountingPeriod', on_delete=models.PROTECT, related_name='journal_entries')

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Journal Entry'
        verbose_name_plural = 'Journal Entries'

    def __str__(self):
        return f"{self.entry_number} - {self.date}"

    def post(self):
        if self.status != 'draft':
            raise ValueError("Only draft entries can be posted")
        
        # Validate that entry balances
        total_debit = sum(line.debit_amount for line in self.lines.all())
        total_credit = sum(line.credit_amount for line in self.lines.all())
        
        if total_debit != total_credit:
            raise ValueError("Journal entry must balance (debits must equal credits)")
        
        self.status = 'posted'
        self.posted_at = timezone.now()
        self.save()
        
        # Update account balances
        for line in self.lines.all():
            account = line.account
            if line.account.account_type in ['asset', 'expense']:
                account.balance += line.debit_amount - line.credit_amount
            else:
                account.balance += line.credit_amount - line.debit_amount
            account.save()


class JournalEntryLine(TenantScopedModel):
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='journal_lines')
    description = models.TextField(blank=True)
    debit_amount = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK', default=0)
    credit_amount = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK', default=0)

    class Meta:
        verbose_name = 'Journal Entry Line'
        verbose_name_plural = 'Journal Entry Lines'

    def __str__(self):
        return f"{self.account.code} - {self.debit_amount or self.credit_amount}"


class AccountingPeriod(TenantScopedModel):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    is_closed = models.BooleanField(default=False)
    closed_at = models.DateTimeField(null=True, blank=True)
    closed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='closed_periods'
    )

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Accounting Period'
        verbose_name_plural = 'Accounting Periods'

    def __str__(self):
        return f"{self.name} ({self.start_date} to {self.end_date})"


class Invoice(TenantScopedModel):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey('operations.Customer', on_delete=models.PROTECT, related_name='invoices')
    date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    subtotal = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK', default=0)
    tax_amount = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK', default=0)
    total_amount = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK', default=0)
    notes = models.TextField(blank=True)
    posted = models.BooleanField(default=False)
    posted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.name}"

    def calculate_totals(self):
        subtotal = sum(line.quantity * line.unit_price for line in self.lines.all())
        tax_rate = getattr(self, 'tax_rate', 0.16)
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount
        
        self.subtotal = subtotal
        self.tax_amount = tax_amount
        self.total_amount = total_amount
        self.save()


class InvoiceLine(TenantScopedModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey('operations.Product', on_delete=models.PROTECT, related_name='invoice_lines')
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    unit_price = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK')
    line_total = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK', default=0)

    class Meta:
        verbose_name = 'Invoice Line'
        verbose_name_plural = 'Invoice Lines'

    def save(self, *args, **kwargs):
        self.line_total = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Budget(TenantScopedModel):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('closed', 'Closed'),
    ]

    name = models.CharField(max_length=200)
    fiscal_year = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    start_date = models.DateField()
    end_date = models.DateField()
    total_budget = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK', default=0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-fiscal_year', 'name']
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'

    def __str__(self):
        return f"{self.name} - {self.fiscal_year}"


class BudgetLine(TenantScopedModel):
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='budget_lines')
    amount = MoneyField(max_digits=15, decimal_places=2, default_currency='MWK')
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Budget Line'
        verbose_name_plural = 'Budget Lines'

    def __str__(self):
        return f"{self.account.code} - {self.amount}"
