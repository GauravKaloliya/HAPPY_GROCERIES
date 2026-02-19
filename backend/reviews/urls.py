from django.urls import path
from . import views

urlpatterns = [
    # Product reviews
    path('product/<int:product_id>/', views.ProductReviewViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='product-reviews'),
    
    # Single review actions
    path('<int:pk>/', views.ProductReviewViewSet.as_view({
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='review-detail'),
    
    # Mark review as helpful
    path('<int:pk>/helpful/', views.ProductReviewViewSet.as_view({
        'post': 'helpful'
    }), name='review-helpful'),
    
    # Review summary
    path('product/<int:product_id>/summary/', views.product_review_summary, name='review-summary'),
    
    # User's reviews
    path('my-reviews/', views.my_reviews, name='my-reviews'),
    
    # Pending reviews (products that can be reviewed)
    path('pending/', views.pending_reviews, name='pending-reviews'),
]
