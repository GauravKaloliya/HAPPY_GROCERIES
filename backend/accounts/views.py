from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'success': True,
            'user': UserSerializer(user).data,
            'message': 'User registered successfully.'
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """Get current user details."""
    serializer = UserSerializer(request.user)
    return Response({
        'success': True,
        'user': serializer.data
    })


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile_view(request):
    """Update current user profile."""
    serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data,
            'message': 'Profile updated successfully.'
        })
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    """Change user password."""
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'success': False,
                'message': 'Old password is incorrect.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({
            'success': True,
            'message': 'Password changed successfully.'
        })
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout user (client should remove tokens)."""
    return Response({
        'success': True,
        'message': 'Logged out successfully.'
    })
