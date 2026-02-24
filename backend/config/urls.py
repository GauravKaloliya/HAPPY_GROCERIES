"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from .views import api_documentation
from .health_views import health_check, api_status

urlpatterns = [
    path('', api_documentation, name='api-docs'),
    path('health/', health_check, name='health-check'),
    path('status/', api_status, name='api-status'),
    path('admin/', admin.site.urls),
    path('auth/', include('users.urls')),
    path('products/', include('products.urls')),
    path('cart/', include('cart.urls')),
    path('orders/', include('orders.urls')),
    path('coupons/', include('coupons.urls')),
    path('wishlist/', include('wishlist.urls')),
    path('activity-logs/', include('activity_logs.urls')),
    path('contact/', include('contact.urls')),
    path('config/', include('site_config.urls')),
    path('reviews/', include('reviews.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
