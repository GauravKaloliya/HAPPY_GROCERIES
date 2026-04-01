from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from datetime import timedelta
from django.utils import timezone
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q, F

from config.admin_auth import (
    get_admin_password,
    get_admin_username,
    issue_admin_token,
    is_admin_request,
)
from config.error_handling import BadRequestError, UnauthorizedError, ServiceUnavailableError
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    """Check if username is available."""
    username = request.query_params.get('username', '').strip()
    if not username:
        return Response({'available': False, 'message': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
    if len(username) < 3:
        return Response({'available': False, 'message': 'Username must be at least 3 characters'}, status=status.HTTP_400_BAD_REQUEST)
    if not username.isalnum():
        return Response({'available': False, 'message': 'Username can only contain letters and numbers'}, status=status.HTTP_400_BAD_REQUEST)
    exists = User.objects.filter(username=username).exists()
    return Response({
        'available': not exists,
        'message': 'Username is already taken' if exists else 'Username is available'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def check_email(request):
    """Check if email is available and valid."""
    email = request.query_params.get('email', '').strip()
    if not email:
        return Response({'available': False, 'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_email(email)
    except DjangoValidationError:
        return Response({'available': False, 'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
    exists = User.objects.filter(email=email).exists()
    return Response({
        'available': not exists,
        'message': 'Email is already registered' if exists else 'Email is available'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def check_phone(request):
    """Check if phone is available and valid."""
    phone = request.query_params.get('phone', '').strip()
    if not phone:
        return Response({'available': False, 'message': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not phone.isdigit():
        return Response({'available': False, 'message': 'Phone number must contain only digits'}, status=status.HTTP_400_BAD_REQUEST)
    if len(phone) != 10:
        return Response({'available': False, 'message': 'Phone number must be 10 digits'}, status=status.HTTP_400_BAD_REQUEST)
    exists = User.objects.filter(phone=phone).exists()
    return Response({
        'available': not exists,
        'message': 'Phone number is already registered' if exists else 'Phone number is available'
    })


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        response = Response({
            'user': UserSerializer(user).data,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }, status=status.HTTP_201_CREATED)

        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            secure=True,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60
        )

        return response


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get('username') or '').strip()
        password = request.data.get('password') or ''

        if username != get_admin_username() or password != get_admin_password():
            raise UnauthorizedError('Invalid admin credentials.')

        return Response({
            'token': issue_admin_token(),
            'username': get_admin_username(),
        }, status=status.HTTP_200_OK)


class AdminSessionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not is_admin_request(request):
            raise UnauthorizedError('Admin authentication required.')

        return Response({
            'authenticated': True,
            'username': get_admin_username(),
        }, status=status.HTTP_200_OK)


class LoginView(APIView):
    """User login endpoint with JWT token generation."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']
        password = serializer.validated_data['password']
        
        # Check if user exists
        try:
            user_obj = User.objects.get(phone=phone)
        except User.DoesNotExist:
            raise UnauthorizedError('Phone number / password is incorrect.')
        
        # Check if account is locked
        if user_obj.locked_until and user_obj.locked_until > timezone.now():
            raise ServiceUnavailableError('Account is temporarily locked. Please try again later.')
        
        # Authenticate user
        user = authenticate(username=phone, password=password)
        
        if user is None:
            # Increment failed login attempts
            user_obj.failed_login_attempts += 1
            
            # Lock account after 5 failed attempts
            if user_obj.failed_login_attempts >= 5:
                user_obj.locked_until = timezone.now() + timedelta(minutes=15)
            
            user_obj.save()
            
            raise UnauthorizedError('Phone number / password is incorrect.')
        
        # Reset failed login attempts on successful login
        user.failed_login_attempts = 0
        user.locked_until = None
        user.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        response = Response({
            'user': UserSerializer(user).data,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        })
        
        # Set refresh token as httpOnly cookie
        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            secure=True,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        return response


class LogoutView(APIView):
    """User logout endpoint with token blacklisting."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            raise UnauthorizedError('No refresh token cookie provided')

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as e:
            raise BadRequestError(str(e)) from e

        response = Response({'message': 'Successfully logged out'})
        response.delete_cookie('refresh_token')
        return response


class RefreshTokenView(APIView):
    """Token refresh endpoint with rotation."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            raise UnauthorizedError('No refresh token provided')
        
        try:
            # Rotate the token
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)
            
            # Create response with new tokens
            response = Response({
                'access_token': new_access_token,
            })
            
            # Set rotated refresh token as httpOnly cookie
            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                secure=True,
                samesite='Lax',
                max_age=7 * 24 * 60 * 60  # 7 days
            )
            
            return response
            
        except TokenError:
            raise UnauthorizedError('Invalid or expired refresh token')


class ProfileView(APIView):
    """Get and update user profile."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    
    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """Change user password."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(old_password):
            raise BadRequestError('Current password is incorrect')
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'})


class UserStatsView(APIView):
    """Get user stats for profile dashboard."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Import models here to avoid circular imports
        from orders.models import Order
        from wishlist.models import WishlistItem
        from coupons.models import Coupon
        
        # Count orders (not deleted)
        orders_count = Order.objects.filter(
            user=user,
            is_deleted=False
        ).count()
        
        # Count wishlist items (not deleted)
        wishlist_count = WishlistItem.objects.filter(
            user=user,
            is_deleted=False
        ).count()
        
        # Count available active coupons
        now = timezone.now()
        coupons_count = Coupon.objects.filter(
            is_active=True,
            is_deleted=False
        ).filter(
            Q(valid_from__isnull=True) | Q(valid_from__lte=now)
        ).filter(
            Q(valid_until__isnull=True) | Q(valid_until__gte=now)
        ).exclude(
            Q(usage_limit__isnull=False) & Q(usage_count__gte=F('usage_limit'))
        ).count()
        
        return Response({
            'orders': orders_count,
            'wishlist': wishlist_count,
            'coupons': coupons_count
        })
