from rest_framework import generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductListSerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CategoryProductsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        category_id = self.kwargs.get('pk')
        return Product.objects.filter(category_id=category_id, is_active=True)


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Search
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(category__name__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Category filter
        category = self.request.query_params.get('category', '')
        if category and category != 'All':
            queryset = queryset.filter(category__name=category)
        
        # Sorting
        sort_by = self.request.query_params.get('sort', 'default')
        if sort_by == 'price-low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price-high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'name-asc':
            queryset = queryset.order_by('name')
        elif sort_by == 'name-desc':
            queryset = queryset.order_by('-name')
        elif sort_by == 'rating':
            queryset = queryset.order_by('-rating')
        
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'


class FeaturedProductsView(generics.ListAPIView):
    """Get featured products (first 8 active products)."""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Product.objects.filter(is_active=True, stock__gt=0)[:8]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_products(request):
    """Search products with filters."""
    query = request.query_params.get('q', '')
    category = request.query_params.get('category', 'All')
    sort_by = request.query_params.get('sort', 'default')
    
    queryset = Product.objects.filter(is_active=True)
    
    if query:
        queryset = queryset.filter(
            Q(name__icontains=query) | 
            Q(category__name__icontains=query) |
            Q(description__icontains=query)
        )
    
    if category and category != 'All':
        queryset = queryset.filter(category__name=category)
    
    if sort_by == 'price-low':
        queryset = queryset.order_by('price')
    elif sort_by == 'price-high':
        queryset = queryset.order_by('-price')
    elif sort_by == 'name-asc':
        queryset = queryset.order_by('name')
    elif sort_by == 'name-desc':
        queryset = queryset.order_by('-name')
    elif sort_by == 'rating':
        queryset = queryset.order_by('-rating')
    
    serializer = ProductListSerializer(queryset, many=True)
    return Response({
        'success': True,
        'count': len(serializer.data),
        'results': serializer.data
    })
