from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models

from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from .services.order_service import OrderService
from cart.models import Cart


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for order operations."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'delivery_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).prefetch_related(
            'items__product'
        )
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Create a new order from cart."""
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Get or create user's cart
            cart = Cart.objects.get(user=request.user, is_deleted=False)
            
            if cart.total_items == 0:
                return Response(
                    {'error': 'Cart is empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create order
            order = OrderService.create_order(
                user=request.user,
                cart=cart,
                delivery_data=serializer.validated_data
            )
            
            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to create order'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order."""
        try:
            order = self.get_object()
            cancelled_order = OrderService.cancel_order(order, request.user)
            
            return Response(
                OrderSerializer(cancelled_order).data
            )
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Soft delete an order."""
        order = self.get_object()
        order.soft_delete()
        return Response({'message': 'Order soft deleted successfully'})
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted order."""
        order = self.get_object()
        order.restore()
        return Response({'message': 'Order restored successfully'})
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get order statistics for the user."""
        stats = OrderService.get_order_statistics(request.user)
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active orders (pending, confirmed, processing, shipped)."""
        active_orders = self.get_queryset().filter(
            status__in=['pending', 'confirmed', 'processing', 'shipped']
        )
        
        serializer = self.get_serializer(active_orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past orders (delivered, cancelled)."""
        past_orders = self.get_queryset().filter(
            status__in=['delivered', 'cancelled']
        )
        
        serializer = self.get_serializer(past_orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def all_orders(self, request):
        """Get all orders including soft-deleted."""
        include_deleted = request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if include_deleted:
            queryset = Order.objects.filter(user=self.request.user).prefetch_related(
                'items__product'
            )
        else:
            queryset = self.get_queryset()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status."""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        
        return Response(OrderSerializer(order).data)