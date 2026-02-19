from rest_framework import serializers
from .models import SiteSettings, SortOption


class SiteSettingsSerializer(serializers.ModelSerializer):
    """Serializer for site settings."""
    
    class Meta:
        model = SiteSettings
        fields = [
            'tax_rate',
            'standard_delivery_charge',
            'express_delivery_charge',
            'free_delivery_threshold',
            'site_name',
            'site_currency',
        ]


class SortOptionSerializer(serializers.ModelSerializer):
    """Serializer for sort options."""
    
    class Meta:
        model = SortOption
        fields = ['value', 'label', 'order']
