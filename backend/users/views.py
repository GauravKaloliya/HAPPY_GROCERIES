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

from .models import User, UserActivityLog, ContactForm
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, UserActivityLogSerializer, CreateActivityLogSerializer, ContactFormSerializer


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
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if account is locked
        if user.locked_until and user.locked_until > timezone.now():
            return Response(
                {'error': 'Account is temporarily locked. Please try again later.'},
                status=status.HTTP_423_LOCKED
            )
        
        # Authenticate user
        user = authenticate(username=phone, password=password)
        
        if user is None:
            # Increment failed login attempts
            user.failed_login_attempts += 1
            
            # Lock account after 5 failed attempts
            if user.failed_login_attempts >= 5:
                user.locked_until = timezone.now() + timedelta(minutes=15)
            
            user.save()
            
            return Response(
                {'error': 'Invalid credentials'},
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


class ActivityLogListView(generics.ListAPIView):
    """List user activity logs."""
    serializer_class = UserActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserActivityLog.objects.filter(user=self.request.user)
    
    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ActivityLogCreateView(generics.CreateAPIView):
    """Create activity log entry."""
    serializer_class = CreateActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get client IP address
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        session_id = serializer.validated_data.get('session_id', '')
        
        # Create activity log entry
        activity_log = UserActivityLog.objects.create(
            user=request.user,
            activity_type=serializer.validated_data['activity_type'],
            description=serializer.validated_data.get('description', ''),
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=serializer.validated_data.get('metadata', {}),
            session_id=session_id
        )
        
        response_serializer = UserActivityLogSerializer(activity_log)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ActivityLogStatsView(APIView):
    """Get activity statistics."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta
        
        user = request.user
        
        # Get today's activities
        today = timezone.now().date()
        today_activities = UserActivityLog.objects.filter(
            user=user,
            created_at__date=today
        ).count()
        
        # Get last 7 days activities
        week_ago = today - timedelta(days=7)
        week_activities = UserActivityLog.objects.filter(
            user=user,
            created_at__date__gte=week_ago
        ).count()
        
        # Get activity type breakdown
        activity_types = UserActivityLog.objects.filter(
            user=user
        ).values('activity_type').annotate(
            count=Count('activity_type')
        ).order_by('-count')[:5]
        
        # Get recent activity
        recent_activities = UserActivityLog.objects.filter(
            user=user
        )[:10]
        
        return Response({
            'today_activities': today_activities,
            'week_activities': week_activities,
            'activity_type_breakdown': list(activity_types),
            'recent_activities': UserActivityLogSerializer(recent_activities, many=True).data
        })


class ContactFormView(APIView):
    """Handle contact form submissions."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ContactFormSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get client IP address
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create contact form submission
        contact_form = ContactForm.objects.create(
            name=serializer.validated_data['name'],
            email=serializer.validated_data['email'],
            phone=serializer.validated_data['phone'],
            category=serializer.validated_data.get('category', 'general'),
            subject=serializer.validated_data['subject'],
            message=serializer.validated_data['message'],
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Log the activity if user is authenticated
        if request.user.is_authenticated:
            try:
                UserActivityLog.objects.create(
                    user=request.user,
                    activity_type='contact_submit',
                    description=f'Submitted contact form: {contact_form.subject}',
                    ip_address=ip_address,
                    user_agent=user_agent,
                    metadata={'contact_form_id': contact_form.id}
                )
            except Exception:
                pass  # Don't fail if logging fails
        
        return Response({
            'message': 'Your message has been sent successfully!',
            'reference_id': contact_form.id
        }, status=status.HTTP_201_CREATED)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
