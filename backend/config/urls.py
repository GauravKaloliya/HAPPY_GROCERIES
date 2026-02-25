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
    path('api/status/', api_status, name='api-status'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/coupons/', include('coupons.urls')),
    path('api/wishlist/', include('wishlist.urls')),
    path('api/activity-logs/', include('activity_logs.urls')),
    path('api/contact/', include('contact.urls')),
    path('api/config/', include('site_config.urls')),
    path('api/reviews/', include('reviews.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if getattr(settings, 'FRONTEND_DIST_DIR', None) and settings.FRONTEND_DIST_DIR.exists():
    # Match any path that doesn't start with api/, admin/, static/, or media/
    urlpatterns += [
        re_path(r'^(?!api/|admin/|static/|media/).*$', TemplateView.as_view(template_name='index.html'))
    ]
