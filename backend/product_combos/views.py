from django.db import DatabaseError, transaction
from django.db.models import Prefetch
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from config.error_handling import ServiceUnavailableError
from .models import ProductCombo, ProductComboItem
from .serializers import ProductComboListSerializer, ProductComboSerializer


class ProductComboViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = ProductComboSerializer
    ordering = ['display_order', 'name']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductComboListSerializer
        return ProductComboSerializer

    def get_queryset(self):
        try:
            queryset = ProductCombo.objects.filter(is_deleted=False, is_active=True).prefetch_related(
                Prefetch(
                    'items',
                    queryset=ProductComboItem.objects.filter(is_deleted=False).select_related('product', 'variant').order_by('display_order', 'id'),
                )
            )

            featured = self.request.query_params.get('featured')
            if featured and featured.lower() == 'true':
                queryset = queryset.filter(is_featured=True)

            stock_status = self.request.query_params.get('stock_status')
            if stock_status:
                queryset = queryset.filter(stock_status=stock_status)

            search = self.request.query_params.get('search')
            if search:
                queryset = queryset.filter(name__icontains=search)

            return queryset
        except DatabaseError as exc:
            raise ServiceUnavailableError(
                'Combo functionality is unavailable because required schema objects are missing',
                code='schema_mismatch',
            ) from exc

    def list(self, request, *args, **kwargs):
        try:
            limit = request.query_params.get('limit')
            offset = request.query_params.get('offset')
            queryset = self.filter_queryset(self.get_queryset())
            total_count = queryset.count()

            if offset:
                try:
                    offset = int(offset)
                    if offset > 0:
                        queryset = queryset[offset:]
                except (TypeError, ValueError):
                    pass

            if limit:
                try:
                    limit = int(limit)
                    if limit > 0:
                        queryset = queryset[:limit]
                except (TypeError, ValueError):
                    pass

            serializer = self.get_serializer(queryset, many=True)
            return Response({'results': serializer.data, 'count': total_count})
        except DatabaseError as exc:
            raise ServiceUnavailableError(
                'Combo functionality is unavailable because required schema objects are missing',
                code='schema_mismatch',
            ) from exc

    @action(detail=False, methods=['get'])
    def featured(self, request):
        try:
            combos = self.get_queryset().filter(is_featured=True).order_by('display_order', 'name')
            serializer = ProductComboListSerializer(combos, many=True)
            return Response(serializer.data)
        except DatabaseError as exc:
            raise ServiceUnavailableError(
                'Combo functionality is unavailable because required schema objects are missing',
                code='schema_mismatch',
            ) from exc

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def refresh_stock(self, request):
        """
        Recalculate stock_status for active combos from variant stocks.
        """
        try:
            updated = 0
            with transaction.atomic():
                combos = (
                    ProductCombo.objects.filter(is_deleted=False, is_active=True)
                    .prefetch_related(
                        Prefetch(
                            'items',
                            queryset=ProductComboItem.objects.filter(is_deleted=False).select_related('variant'),
                        )
                    )
                )
                for combo in combos:
                    items = list(combo.items.all())
                    if not items:
                        next_status = 'out_of_stock'
                    else:
                        out_of_stock = any((item.variant.stock_quantity or 0) < item.quantity for item in items)
                        low_stock = any((item.variant.stock_quantity or 0) <= (item.variant.low_stock_threshold or 10) for item in items)
                        if out_of_stock:
                            next_status = 'out_of_stock'
                        elif low_stock:
                            next_status = 'low'
                        else:
                            next_status = 'available'

                    if combo.stock_status != next_status:
                        combo.stock_status = next_status
                        combo.save(update_fields=['stock_status', 'updated_at'])
                        updated += 1

            return Response({'updated': updated}, status=status.HTTP_200_OK)
        except DatabaseError as exc:
            raise ServiceUnavailableError(
                'Combo functionality is unavailable because required schema objects are missing',
                code='schema_mismatch',
            ) from exc
