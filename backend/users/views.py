from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import redis
import os
from datetime import timedelta
from django.utils import timezone

from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer


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
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response(
                {'error': 'Phone number not registered. Please check your number or sign up.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if account is locked
        if user.locked_until and user.locked_until > timezone.now():
            return Response(
                {'error': 'Account is temporarily locked. Please try again later.'},
                status=status.HTTP_423_LOCKED
            )
        
        # Authenticate user - keep reference to DB user object before authenticate overwrites it
        db_user = user
        user = authenticate(username=phone, password=password)
        
        if user is None:
            # Increment failed login attempts on the original db_user object
            db_user.failed_login_attempts += 1
            
            # Lock account after 5 failed attempts
            if db_user.failed_login_attempts >= 5:
                db_user.locked_until = timezone.now() + timedelta(minutes=15)
            
            db_user.save()
            
            return Response(
                {'error': 'Incorrect password. Please try again.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
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
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            
            if refresh_token:
                # Blacklist the refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                # Try to blacklist access token in Redis if available
                try:
                    redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
                    r = redis.from_url(redis_url)
                    access_token = request.auth
                    if access_token:
                        # Set expiry matching the access token lifetime (15 min in production)
                        r.setex(
                            f'blacklist:{access_token}',
                            900,  # 15 minutes
                            '1'
                        )
                except Exception:
                    pass  # Redis might not be available
            
            response = Response({'message': 'Successfully logged out'})
            response.delete_cookie('refresh_token')
            return response
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RefreshTokenView(APIView):
    """Token refresh endpoint with rotation."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'No refresh token provided'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            # Check if token is blacklisted
            try:
                redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
                r = redis.from_url(redis_url)
                token_obj = RefreshToken(refresh_token)
                if r.get(f'blacklist:{token_obj.access_token}'):
                    return Response(
                        {'error': 'Token has been revoked'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Exception:
                pass  # Redis might not be available
            
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
            
        except Exception as e:
            return Response(
                {'error': 'Invalid or expired refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )


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
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'})


class CheckUsernameView(APIView):
    """Check if username (phone) already exists."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        
        if not phone:
            return Response(
                {'available': False, 'message': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove any non-digit characters
        phone = ''.join(filter(str.isdigit, phone))
        
        if len(phone) != 10:
            return Response(
                {'available': False, 'message': 'Phone must be 10 digits'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exists = User.objects.filter(phone=phone, is_deleted=False).exists()
        
        return Response({
            'available': not exists,
            'message': 'Phone number already exists' if exists else 'Phone number is available'
        })


class CheckEmailView(APIView):
    """Check if email already exists."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'available': True, 'message': 'Email is optional'},
                status=status.HTTP_200_OK
            )
        
        exists = User.objects.filter(email__iexact=email, is_deleted=False).exclude(email='').exists()
        
        return Response({
            'available': not exists,
            'message': 'Email already exists' if exists else 'Email is available'
        })


class CheckPasswordView(APIView):
    """Validate password strength and availability."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        password = request.data.get('password')
        
        if not password:
            return Response(
                {'valid': False, 'message': 'Password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use Django's password validation
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        
        try:
            validate_password(password)
            return Response({
                'valid': True,
                'message': 'Password is valid'
            })
        except ValidationError as e:
            return Response({
                'valid': False,
                'message': e.messages[0] if e.messages else 'Invalid password'
            })
