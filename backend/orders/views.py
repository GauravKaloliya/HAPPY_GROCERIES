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
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items__product'
        )
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Create a new order from cart."""
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Get or create user's cart
            cart = Cart.objects.get(user=request.user)
            
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