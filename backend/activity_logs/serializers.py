from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for ActivityLog model."""

    user = serializers.StringRelatedField(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    device_type_display = serializers.CharField(source='get_device_type_display', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'action', 'action_display', 'page', 'details',
            'ip_address', 'user_agent', 'session_id', 'device_type', 
            'device_type_display', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ActivityLogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating activity logs from frontend."""

    device_type = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = ActivityLog
        fields = [
            'action', 'page', 'details', 'session_id', 'device_type'
        ]

    def validate_device_type(self, value):
        """Validate device_type is one of the allowed values."""
        if value is None:
            return value
        valid_types = ['mobile', 'web', 'tablet', 'desktop', 'other']
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid device_type. Must be one of: {', '.join(valid_types)}"
            )
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user

        # Get IP address and user agent from request
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            
            # Auto-detect device type if not provided
            if 'device_type' not in validated_data or validated_data['device_type'] is None:
                validated_data['device_type'] = self.detect_device_type(request)

        return super().create(validated_data)

    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def detect_device_type(self, request):
        """Detect device type from user agent."""
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        
        if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
            return 'mobile'
        elif 'tablet' in user_agent or 'ipad' in user_agent:
            return 'tablet'
        elif 'desktop' in user_agent:
            return 'desktop'
        else:
            return 'web'
