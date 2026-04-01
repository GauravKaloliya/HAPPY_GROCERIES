from django.db.models import DecimalField, OuterRef, Q, Subquery, F
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from config.admin_auth import IsAdminPanelAuthenticated, is_admin_request
from .models import Category, Product, ProductVariant
from .serializers import CategorySerializer, ProductListSerializer, ProductSerializer, AdminProductSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_deleted=False, is_visible=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'description', 'category__name', 'tags']
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
    ordering = ['-created_at', '-id']

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
        if self.action in {'create', 'update', 'partial_update'}:
            return AdminProductSerializer
        if self.action in {'list', 'retrieve'} and is_admin_request(self.request):
            return AdminProductSerializer
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [IsAdminPanelAuthenticated()]
        return [AllowAny()]

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)
        obj = self.get_queryset().filter(pk=lookup_value).first()
        if obj is None:
            raise NotFound('Product not found.')
        self.check_object_permissions(self.request, obj)
        return obj

    def _base_queryset(self):
        default_variant_qs = ProductVariant.objects.filter(
            product_id=OuterRef('pk'),
            is_deleted=False,
        ).order_by('-is_default', 'id')

        return (
            Product.objects.filter(is_active=True, is_deleted=False)
            .select_related('category')
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
        include_deleted = self.request.query_params.get('include_deleted', '').lower() == 'true'
        if include_deleted and is_admin_request(self.request):
            queryset = (
                Product.objects.all()
                .select_related('category')
                .prefetch_related('variants')
                .annotate(
                    default_price=Subquery(
                        ProductVariant.objects.filter(
                            product_id=OuterRef('pk'),
                            is_deleted=False,
                        ).order_by('-is_default', 'id').values('price')[:1],
                        output_field=DecimalField(max_digits=12, decimal_places=2),
                    ),
                    default_stock=Subquery(
                        ProductVariant.objects.filter(
                            product_id=OuterRef('pk'),
                            is_deleted=False,
                        ).order_by('-is_default', 'id').values('stock_quantity')[:1]
                    ),
                    effective_price_value=Coalesce('default_price', F('price_db')),
                    effective_stock_value=Coalesce('default_stock', F('stock_db')),
                )
            )

        category = self.request.query_params.get('category')
        if category and category != 'All':
            category = category.strip()
            if category:
                queryset = queryset.filter(category__name__iexact=category)

        search = self.request.query_params.get('search')
        if search:
            search_filter = (
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(category__name__icontains=search)
                | Q(tags__overlap=[search])
            )
            if search.isdigit():
                search_filter |= Q(id=int(search))
            queryset = queryset.filter(search_filter)

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(effective_price_value__gte=min_price)
        if max_price:
            queryset = queryset.filter(effective_price_value__lte=max_price)

        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(effective_stock_value__gt=0)

        return queryset.order_by(*self.get_ordering())

    def list(self, request, *args, **kwargs):
        limit = request.query_params.get('limit')
        offset = request.query_params.get('offset')
        queryset = self.filter_queryset(self.get_queryset())
        total_count = None

        if not is_admin_request(request):
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
        serialized = serializer.data
        if total_count is None:
            total_count = len(serialized)
        return Response({'results': serialized, 'count': total_count})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        product = self.get_object()
        serializer = self.get_serializer(product, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductSerializer(product).data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        product.soft_delete()
        return Response({'message': 'Product soft deleted successfully.'}, status=status.HTTP_200_OK)

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
        serializer = ProductListSerializer(featured[:8], many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        product = self.get_object()
        related_products = self.get_queryset().filter(category=product.category).exclude(id=product.id)[:4]
        serializer = ProductListSerializer(related_products, many=True)
        return Response(serializer.data)
