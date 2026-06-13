from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (AccountViewSet, AccountingPeriodViewSet, JournalEntryViewSet, 
                    InvoiceViewSet, BudgetViewSet)

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'periods', AccountingPeriodViewSet, basename='accountingperiod')
router.register(r'journal-entries', JournalEntryViewSet, basename='journalentry')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'budgets', BudgetViewSet, basename='budget')

urlpatterns = [
    path('', include(router.urls)),
]
