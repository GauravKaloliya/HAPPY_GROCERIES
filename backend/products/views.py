from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F, ExpressionWrapper, DecimalField, Value

from .models import Category, Product, Combo
from .serializers import (
    CategorySerializer, ProductSerializer, ProductListSerializer, ComboSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for categories."""
    
    queryset = Category.objects.filter(is_deleted=False)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for products."""

    queryset = Product.objects.filter(is_active=True, is_deleted=False).select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['name', 'price', 'rating', 'created_at']
    ordering = ['id']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()

        # Category filter
        category = self.request.query_params.get('category')
        if category and category != 'All':
            queryset = queryset.filter(category__name=category)

        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )

        # Min/Max price filter (use annotated discounted price)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if min_price or max_price:
            annotated_price_expression = ExpressionWrapper(
                F('price') * (Value(1) - (F('discount_percent') / Value(100.0))),
                output_field=DecimalField(max_digits=10, decimal_places=2)
            )
            queryset = queryset.annotate(annotated_effective_price=annotated_price_expression)

            if min_price:
                queryset = queryset.filter(annotated_effective_price__gte=min_price)
            if max_price:
                queryset = queryset.filter(annotated_effective_price__lte=max_price)

        # In stock filter
        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock__gt=0)

        return queryset
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all unique categories from products."""
        categories = Category.objects.filter(
            products__is_active=True,
            products__is_deleted=False,
            is_deleted=False
        ).distinct()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products (high rating and discount)."""
        products = self.get_queryset().filter(
            rating__gte=4.5
        ).order_by('-rating', '-discount_percent')[:8]
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """Get related products from the same category."""
        try:
            product = self.get_object()
            related_products = self.get_queryset().filter(
                category=product.category
            ).exclude(id=product.id)[:4]
            serializer = ProductListSerializer(related_products, many=True)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ComboViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for product combos."""

    queryset = Combo.objects.filter(is_active=True, is_deleted=False).prefetch_related('products')
    serializer_class = ComboSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Only return combos where all products are active
        for combo in queryset:
            active_products = combo.products.filter(is_active=True, is_deleted=False)
            if active_products.count() < 2:
                queryset = queryset.exclude(id=combo.id)
        return queryset
