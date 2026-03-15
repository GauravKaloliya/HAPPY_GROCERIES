from django.db.models import DecimalField, OuterRef, Q, Subquery, F
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Brand, Category, Product, ProductVariant
from .serializers import BrandSerializer, CategorySerializer, ProductListSerializer, ProductSerializer


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.filter(is_deleted=False, is_active=True).order_by('name')
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_deleted=False, is_visible=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name', 'brand__name', 'tags']
    ordering_fields = [
        'name',
        'average_rating',
        'review_count',
        'created_at',
        'default_price',
        'default_stock',
        'effective_price_value',
        'effective_stock_value',
        'price',
        'stock',
        'rating',
        'reviews_count',
    ]
    ordering = ['id']

    def get_ordering(self):
        ordering = self.request.query_params.get('ordering')
        if not ordering:
            return self.ordering

        mapping = {
            'price': 'effective_price_value',
            '-price': '-effective_price_value',
            'stock': 'effective_stock_value',
            '-stock': '-effective_stock_value',
            'rating': 'average_rating',
            '-rating': '-average_rating',
            'reviews_count': 'review_count',
            '-reviews_count': '-review_count',
        }

        mapped = []
        for field in ordering.split(','):
            field = field.strip()
            if not field:
                continue
            mapped.append(mapping.get(field, field))
        return mapped or self.ordering

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def _base_queryset(self):
        default_variant_qs = ProductVariant.objects.filter(
            product_id=OuterRef('pk'),
            is_deleted=False,
        ).order_by('-is_default', 'id')

        return (
            Product.objects.filter(is_active=True, is_deleted=False)
            .select_related('category', 'brand')
            .prefetch_related('variants')
            .annotate(
                default_price=Subquery(default_variant_qs.values('price')[:1], output_field=DecimalField(max_digits=12, decimal_places=2)),
                default_stock=Subquery(default_variant_qs.values('stock_quantity')[:1]),
                effective_price_value=Coalesce('default_price', F('price_db')),
                effective_stock_value=Coalesce('default_stock', F('stock_db')),
            )
        )

    def get_queryset(self):
        queryset = self._base_queryset()

        category = self.request.query_params.get('category')
        if category and category != 'All':
            category = category.strip()
            if category:
                queryset = queryset.filter(category__name__iexact=category)

        brand = self.request.query_params.get('brand')
        if brand and brand != 'All':
            brand = brand.strip()
            if brand:
                queryset = queryset.filter(brand__name__iexact=brand)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(category__name__icontains=search)
                | Q(brand__name__icontains=search)
                | Q(tags__overlap=[search])
            )

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(effective_price_value__gte=min_price)
        if max_price:
            queryset = queryset.filter(effective_price_value__lte=max_price)

        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(effective_stock_value__gt=0)

        return queryset

    def list(self, request, *args, **kwargs):
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

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Category.objects.filter(
            products__is_active=True,
            products__is_deleted=False,
            is_deleted=False,
            is_visible=True,
        ).distinct()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        queryset = self.get_queryset()
        featured = queryset.filter(is_featured=True).order_by('-average_rating', '-review_count', '-created_at')
        if not featured.exists():
            featured = queryset.order_by('-average_rating', '-review_count', '-created_at')
        serializer = ProductListSerializer(featured[:8], many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        product = self.get_object()
        related_products = self.get_queryset().filter(category=product.category).exclude(id=product.id)[:4]
        serializer = ProductListSerializer(related_products, many=True)
        return Response(serializer.data)
