from rest_framework import serializers
from .models import (Customer, Lead, Product, InventoryItem, InventoryMovement, 
                     Order, OrderLine, Project)


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'code', 'email', 'phone', 'address', 'tax_id', 
                  'credit_limit', 'is_active', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class LeadSerializer(serializers.ModelSerializer):
    assigned_to_email = serializers.EmailField(source='assigned_to.email', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Lead
        fields = ['id', 'name', 'company', 'email', 'phone', 'status', 'source', 
                  'estimated_value', 'probability', 'expected_close_date', 'notes', 
                  'assigned_to', 'assigned_to_email', 'converted_to_customer', 'customer', 
                  'customer_name', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'code', 'description', 'unit_price', 'cost_price', 
                  'sku', 'barcode', 'is_active', 'reorder_level', 'category', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class InventoryItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.code', read_only=True)

    class Meta:
        model = InventoryItem
        fields = ['id', 'product', 'product_name', 'product_code', 'quantity_on_hand', 
                  'quantity_allocated', 'quantity_available', 'location', 'last_count_date', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'quantity_available']


class InventoryMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='inventory_item.product.name', read_only=True)

    class Meta:
        model = InventoryMovement
        fields = ['id', 'inventory_item', 'product_name', 'movement_type', 'quantity', 
                  'reference', 'notes', 'movement_date', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'movement_date']


class OrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.code', read_only=True)

    class Meta:
        model = OrderLine
        fields = ['id', 'order', 'product', 'product_name', 'product_code', 
                  'quantity', 'unit_price', 'line_total', 'notes', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    lines = OrderLineSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'customer', 'customer_name', 'order_date', 
                  'status', 'subtotal', 'tax_amount', 'total_amount', 'notes', 
                  'shipping_address', 'expected_delivery_date', 'lines', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    assigned_to_email = serializers.EmailField(source='assigned_to.email', read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'code', 'description', 'customer', 'customer_name', 
                  'status', 'priority', 'start_date', 'end_date', 'budget', 'progress', 
                  'assigned_to', 'assigned_to_email', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']
