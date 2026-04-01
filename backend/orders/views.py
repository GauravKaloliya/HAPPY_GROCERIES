from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from config.error_handling import BadRequestError
from .models import Order
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
            'items__product__variants'
        )
    
    def create(self, request):
        """Create a new order."""
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload_items = serializer.validated_data.get('items') or []

        cart = Cart.objects.filter(user=request.user, is_deleted=False).first()
        cart_items = None
        if cart:
            cart_items = cart.items.filter(is_deleted=False)

        try:
            order = OrderService.create_order(
                user=request.user,
                # Explicit request items always take precedence over cart snapshot.
                cart=None if payload_items else (cart if cart_items and cart_items.exists() else None),
                delivery_data=serializer.validated_data
            )
        except ValueError as exc:
            raise BadRequestError(str(exc)) from exc

        return Response(
            {
                'id': order.id,
                'order_id': order.order_id,
                'status': order.status,
                'delivery_type': order.delivery_type,
                'total': order.total,
                'estimated_delivery': order.estimated_delivery,
                'message': 'Order placed successfully.',
            },
            status=status.HTTP_201_CREATED
        )
