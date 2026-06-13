from django.contrib import admin
from .models import (Customer, Lead, Product, InventoryItem, InventoryMovement, 
                     Order, OrderLine, Project)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'email', 'phone', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code', 'email']


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'status', 'source', 'probability', 'assigned_to']
    list_filter = ['status', 'source']
    search_fields = ['name', 'company', 'email']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'unit_price', 'is_active', 'category']
    list_filter = ['is_active', 'category']
    search_fields = ['name', 'code', 'sku']


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['product', 'quantity_on_hand', 'quantity_available', 'location']
    list_filter = ['location']
    search_fields = ['product__name', 'product__code']


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ['inventory_item', 'movement_type', 'quantity', 'movement_date']
    list_filter = ['movement_type', 'movement_date']
    search_fields = ['reference', 'notes']


class OrderLineInline(admin.TabularInline):
    model = OrderLine
    extra = 1


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'order_date', 'status', 'total_amount']
    list_filter = ['status', 'order_date']
    search_fields = ['order_number', 'customer__name']
    inlines = [OrderLineInline]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'status', 'priority', 'progress', 'assigned_to']
    list_filter = ['status', 'priority']
    search_fields = ['name', 'code', 'description']
