from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count
from django.db import models

from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductSerializer, ProductListSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for categories."""
    
    queryset = Category.objects.filter(is_deleted=False)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Soft delete a category."""
        category = self.get_object()
        category.soft_delete()
        return Response({'message': 'Category soft deleted successfully'})
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted category."""
        category = self.get_object()
        category.restore()
        return Response({'message': 'Category restored successfully'})


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for products."""
    
    queryset = Product.objects.filter(is_active=True, is_deleted=False).select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
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
        
        # Min/Max price filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
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
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get product statistics."""
        stats = {
            'total_products': Product.objects.filter(is_active=True, is_deleted=False).count(),
            'products_in_stock': Product.objects.filter(is_active=True, is_deleted=False, stock__gt=0).count(),
            'average_price': Product.objects.filter(is_active=True, is_deleted=False).aggregate(
                avg_price=models.Avg('price')
            )['avg_price'] or 0,
            'categories': Category.objects.filter(products__is_active=True, is_deleted=False).count(),
            'total_categories': Category.objects.filter(is_deleted=False).count(),
            'soft_deleted_products': Product.objects.filter(is_deleted=True).count(),
            'soft_deleted_categories': Category.objects.filter(is_deleted=True).count(),
        }
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Soft delete a product."""
        product = self.get_object()
        product.soft_delete()
        return Response({'message': 'Product soft deleted successfully'})
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted product."""
        product = self.get_object()
        product.restore()
        return Response({'message': 'Product restored successfully'})
    
    @action(detail=True, methods=['patch'])
    def update_stock(self, request, pk=None):
        """Update product stock."""
        product = self.get_object()
        new_stock = request.data.get('stock')
        
        if new_stock is None:
            return Response(
                {'error': 'stock is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_stock = int(new_stock)
            if new_stock < 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'stock must be a positive integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.stock = new_stock
        product.save(update_fields=['stock', 'updated_at'])
        
        return Response(ProductSerializer(product).data)
    
    @action(detail=True, methods=['patch'])
    def update_price(self, request, pk=None):
        """Update product price."""
        product = self.get_object()
        new_price = request.data.get('price')
        
        if new_price is None:
            return Response(
                {'error': 'price is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_price = float(new_price)
            if new_price < 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'price must be a positive number'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.price = new_price
        product.save(update_fields=['price', 'updated_at'])
        
        return Response(ProductSerializer(product).data)
    
    @action(detail=True, methods=['patch'])
    def update_discount(self, request, pk=None):
        """Update product discount."""
        product = self.get_object()
        discount = request.data.get('discount_percent')
        
        if discount is None:
            return Response(
                {'error': 'discount_percent is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            discount = int(discount)
            if discount < 0 or discount > 100:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'discount_percent must be between 0 and 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.discount_percent = discount
        product.save(update_fields=['discount_percent', 'updated_at'])
        
        return Response(ProductSerializer(product).data)
    
    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """Toggle product active status."""
        product = self.get_object()
        product.is_active = not product.is_active
        product.save(update_fields=['is_active', 'updated_at'])
        
        return Response(ProductSerializer(product).data)
    
    @action(detail=False, methods=['get'])
    def all_products(self, request):
        """Get all products including soft-deleted."""
        include_deleted = request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if include_deleted:
            queryset = Product.objects.all().select_related('category')
        else:
            queryset = self.get_queryset()
        
        serializer = ProductListSerializer(queryset, many=True)
        return Response(serializer.data)