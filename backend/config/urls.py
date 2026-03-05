"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

from .views import api_documentation
from .health_views import health_check, api_status

urlpatterns = [
    path('', api_documentation, name='api-docs'),
    path('health/', health_check, name='health-check'),
    path('status/', api_status, name='api-status'),
    path('admin/', admin.site.urls),
    path('auth/', include('users.urls')),
    path('products/', include('products.urls')),
    path('combos/', include('product_combos.urls')),
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

if getattr(settings, 'FRONTEND_DIST_DIR', None) and settings.FRONTEND_DIST_DIR.exists():
    # Match any path that doesn't start with known backend prefixes.
    urlpatterns += [
        re_path(
            r'^(?!auth/|products/|combos/|cart/|orders/|coupons/|wishlist/|activity-logs/|contact/|config/|reviews/|health/|status/|admin/|static/|media/).*$',
            TemplateView.as_view(template_name='index.html')
        )
    ]
