from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""

    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'phone', 'email', 'name', 'first_name', 'last_name',
            'avatar', 'is_verified', 'first_order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']

    def get_name(self, obj):
        return obj.name


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=False)
    name = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ['phone', 'email', 'name', 'first_name', 'last_name', 'password', 'password_confirm']
        read_only_fields = ['first_name', 'last_name']

    def validate(self, data):
        # Check password confirmation if provided
        password_confirm = data.get('password_confirm')
        if password_confirm and data['password'] != password_confirm:
            raise serializers.ValidationError("Password confirmation doesn't match")

        # Ensure phone is 10 digits
        if not data['phone'].isdigit() or len(data['phone']) != 10:
            raise serializers.ValidationError("Phone must be 10 digits")

        return data

    def create(self, validated_data):
        # Remove password_confirm from validated data
        validated_data.pop('password_confirm', None)

        # Extract name and split into first_name and last_name
        name = validated_data.pop('name', '')
        name_parts = name.strip().split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        # Extract password
        password = validated_data.pop('password')

        # Create user with split name
        user = User.objects.create(
            **validated_data,
            first_name=first_name,
            last_name=last_name,
            username=validated_data.get('phone', '')  # Use phone as username
        )
        user.set_password(password)
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate_phone(self, value):
        # Remove any non-digit characters from phone
        return ''.join(filter(str.isdigit, value))
    
    def validate(self, data):
        phone = data.get('phone')
        password = data.get('password')
        
        if not phone or not password:
            raise serializers.ValidationError("Phone and password are required")
        
        # Check if user exists
        if not User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Invalid credentials")
        
        return data