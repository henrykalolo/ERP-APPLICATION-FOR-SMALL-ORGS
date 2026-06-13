from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from apps.core.views import BaseModelViewSet
from .models import (Customer, Lead, Product, InventoryItem, InventoryMovement, 
                     Order, OrderLine, Project)
from .serializers import (CustomerSerializer, LeadSerializer, ProductSerializer, 
                          InventoryItemSerializer, InventoryMovementSerializer,
                          OrderSerializer, OrderLineSerializer, ProjectSerializer)


class CustomerViewSet(BaseModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active')
        if is_active:
            queryset = queryset.filter(is_active=is_active == 'true')
        return queryset


class LeadViewSet(BaseModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        assigned_to = self.request.query_params.get('assigned_to')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
            
        return queryset.select_related('assigned_to', 'customer')

    @action(detail=True, methods=['post'])
    def convert_to_customer(self, request, pk=None):
        lead = self.get_object()
        if lead.converted_to_customer:
            return Response({'error': 'Lead already converted to customer'}, status=status.HTTP_400_BAD_REQUEST)
        
        customer = Customer.objects.create(
            name=lead.company or lead.name,
            code=f"CUST-{timezone.now().strftime('%Y%m%d')}-{lead.id}",
            email=lead.email,
            phone=lead.phone,
            tenant=request.tenant,
            created_by=request.user
        )
        
        lead.converted_to_customer = True
        lead.customer = customer
        lead.status = 'won'
        lead.save()
        
        return Response({'message': 'Lead converted to customer successfully', 'customer_id': customer.id})


class ProductViewSet(BaseModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active')
        category = self.request.query_params.get('category')
        
        if is_active:
            queryset = queryset.filter(is_active=is_active == 'true')
        if category:
            queryset = queryset.filter(category=category)
            
        return queryset

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        products = Product.objects.filter(
            inventory__quantity_on_hand__lte=models.F('reorder_level')
        ).select_related('inventory')
        
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class InventoryItemViewSet(BaseModelViewSet):
    queryset = InventoryItem.objects.select_related('product').all()
    serializer_class = InventoryItemSerializer

    @action(detail=True, methods=['post'])
    def adjust(self, request, pk=None):
        inventory_item = self.get_object()
        quantity = request.data.get('quantity')
        movement_type = request.data.get('movement_type', 'adjustment')
        reference = request.data.get('reference', '')
        notes = request.data.get('notes', '')
        
        if quantity is None:
            return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create inventory movement
        InventoryMovement.objects.create(
            inventory_item=inventory_item,
            movement_type=movement_type,
            quantity=quantity,
            reference=reference,
            notes=notes,
            tenant=request.tenant,
            created_by=request.user
        )
        
        # Update inventory quantity
        if movement_type in ['receipt', 'return']:
            inventory_item.quantity_on_hand += quantity
        elif movement_type in ['issue', 'adjustment']:
            inventory_item.quantity_on_hand -= quantity
        
        inventory_item.save()
        
        return Response({'message': 'Inventory adjusted successfully', 'new_quantity': inventory_item.quantity_on_hand})

    @action(detail=False, methods=['post'])
    def adjust_inventory(self, request):
        inventory_item_id = request.data.get('inventory_item') or request.data.get('inventory_item_id')
        if not inventory_item_id:
            return Response({'error': 'inventory_item is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            inventory_item = InventoryItem.objects.get(id=inventory_item_id, tenant=request.tenant)
        except InventoryItem.DoesNotExist:
            return Response({'error': 'Inventory item not found'}, status=status.HTTP_404_NOT_FOUND)

        request.data = request.data.copy()
        request.data['movement_type'] = request.data.get('movement_type', 'adjustment')
        return self.adjust(request, pk=inventory_item.id)


class InventoryMovementViewSet(BaseModelViewSet):
    queryset = InventoryMovement.objects.select_related('inventory_item__product').all()
    serializer_class = InventoryMovementSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        inventory_item = self.request.query_params.get('inventory_item')
        movement_type = self.request.query_params.get('movement_type')
        
        if inventory_item:
            queryset = queryset.filter(inventory_item_id=inventory_item)
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
            
        return queryset


class OrderViewSet(BaseModelViewSet):
    queryset = Order.objects.select_related('customer').prefetch_related('lines').all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        customer = self.request.query_params.get('customer')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if customer:
            queryset = queryset.filter(customer_id=customer)
            
        return queryset

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()
        if order.status != 'draft':
            return Response({'error': 'Only draft orders can be confirmed'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'confirmed'
        order.save()
        
        # Deduct inventory for each order line
        for line in order.lines.all():
            inventory_item = line.product.inventory
            if inventory_item:
                InventoryMovement.objects.create(
                    inventory_item=inventory_item,
                    movement_type='issue',
                    quantity=line.quantity,
                    reference=f"Order {order.order_number}",
                    tenant=request.tenant,
                    created_by=request.user
                )
                inventory_item.quantity_on_hand -= line.quantity
                inventory_item.save()
        
        return Response({'message': 'Order confirmed successfully'})

    @action(detail=True, methods=['post'])
    def calculate_totals(self, request, pk=None):
        order = self.get_object()
        subtotal = sum(line.line_total for line in order.lines.all())
        tax_amount = subtotal * 0.16  # 16% VAT
        total_amount = subtotal + tax_amount
        
        order.subtotal = subtotal
        order.tax_amount = tax_amount
        order.total_amount = total_amount
        order.save()
        
        return Response({
            'subtotal': subtotal,
            'tax_amount': tax_amount,
            'total_amount': total_amount
        })


class ProjectViewSet(BaseModelViewSet):
    queryset = Project.objects.select_related('customer', 'assigned_to').all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        assigned_to = self.request.query_params.get('assigned_to')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
            
        return queryset
