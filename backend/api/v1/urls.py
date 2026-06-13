from django.urls import path, include
from apps.finance.views import JournalEntryViewSet
from apps.operations.views import InventoryItemViewSet, LeadViewSet

app_name = 'v1'

urlpatterns = [
    path('auth/', include('apps.users.urls')),
    path('tenants/', include('apps.tenants.urls')),
    path('authz/', include('apps.authz.urls')),
    path('notifications/', include('apps.notifications.urls')),
    path('hr/', include('apps.hr.urls')),
    path('finance/', include('apps.finance.urls')),
    path('finance/ledger/', JournalEntryViewSet.as_view({'get': 'ledger'}), name='finance-ledger'),
    path('operations/', include('apps.operations.urls')),
    path('crm/leads/', LeadViewSet.as_view({'get': 'list', 'post': 'create'}), name='crm-lead-list'),
    path('crm/leads/<int:pk>/', LeadViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update', 'delete': 'destroy'}), name='crm-lead-detail'),
    path('inventory/stock/', InventoryItemViewSet.as_view({'get': 'list'}), name='inventory-stock-list'),
    path('inventory/stock/<int:pk>/', InventoryItemViewSet.as_view({'get': 'retrieve'}), name='inventory-stock-detail'),
    path('inventory/adjustments/', InventoryItemViewSet.as_view({'post': 'adjust_inventory'}), name='inventory-adjustment-create'),
    path('dms/', include('apps.dms.urls')),
    path('reports/', include('apps.reports.urls')),
]