from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""
    
    class Meta:
        model = User
        fields = [
            'id', 'phone', 'email', 'first_name', 'last_name',
            'avatar', 'is_verified', 'first_order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['phone', 'email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, data):
        # Check password confirmation
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Password confirmation doesn't match")
        
        # Ensure phone is 10 digits
        if not data['phone'].isdigit() or len(data['phone']) != 10:
            raise serializers.ValidationError("Phone must be 10 digits")
        
        return data
    
    def create(self, validated_data):
        # Remove password_confirm from validated data
        validated_data.pop('password_confirm')
        
        # Extract password
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create(**validated_data)
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