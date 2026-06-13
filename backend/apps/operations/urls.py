from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (CustomerViewSet, LeadViewSet, ProductViewSet, InventoryItemViewSet,
                    InventoryMovementViewSet, OrderViewSet, ProjectViewSet)

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'inventory', InventoryItemViewSet, basename='inventoryitem')
router.register(r'inventory-movements', InventoryMovementViewSet, basename='inventorymovement')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'projects', ProjectViewSet, basename='project')

crm_router = DefaultRouter()
crm_router.register(r'leads', LeadViewSet, basename='crm-lead')

urlpatterns = [
    path('', include(router.urls)),
    path('crm/', include(crm_router.urls)),
    path('inventory/stock/', InventoryItemViewSet.as_view({'get': 'list'}), name='inventory-stock-list'),
    path('inventory/stock/<int:pk>/', InventoryItemViewSet.as_view({'get': 'retrieve'}), name='inventory-stock-detail'),
    path('inventory/adjustments/', InventoryItemViewSet.as_view({'post': 'adjust_inventory'}), name='inventory-adjustment-create'),
]
