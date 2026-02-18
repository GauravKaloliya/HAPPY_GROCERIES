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


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for order operations."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'delivery_type']
    ordering = ['-created_at']
    http_method_names = ['get', 'post']
    
    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).prefetch_related(
            'items__product'
        )
    
    def create(self, request):
        """Create a new order."""
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Create order directly from provided data
            order = OrderService.create_order(
                user=request.user,
                cart=None,
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
