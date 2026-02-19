from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import SiteSettings, SortOption
from .serializers import SiteSettingsSerializer, SortOptionSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_site_settings(request):
    """Get site-wide settings."""
    settings = SiteSettings.get_settings()
    serializer = SiteSettingsSerializer(settings)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_sort_options(request):
    """Get active sort options."""
    options = SortOption.objects.filter(is_active=True)
    serializer = SortOptionSerializer(options, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_config(request):
    """Get all configuration in one request."""
    settings = SiteSettings.get_settings()
    sort_options = SortOption.objects.filter(is_active=True)
    
    return Response({
        'settings': SiteSettingsSerializer(settings).data,
        'sort_options': SortOptionSerializer(sort_options, many=True).data,
    })
