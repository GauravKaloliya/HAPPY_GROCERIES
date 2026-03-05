from django.http import JsonResponse
from django.db import connection
from django.db.utils import DatabaseError
from django.core.cache import cache
from django.core.cache.backends.base import InvalidCacheBackendError
from redis.exceptions import RedisError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint that verifies database and cache connectivity.
    This endpoint is used by frontend to verify backend connectivity.
    """
    health_status = {
        'status': 'healthy',
        'database': 'connected',
        'cache': 'connected',
        'timestamp': None,
    }

    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except DatabaseError as e:
        health_status['status'] = 'unhealthy'
        health_status['database'] = 'disconnected'
        health_status['database_error'] = str(e)

    try:
        # Check cache connection (Redis)
        cache.set('health_check', 'ok', 10)
        cache.get('health_check')
    except (RedisError, InvalidCacheBackendError, ValueError, TypeError) as e:
        health_status['status'] = 'unhealthy'
        health_status['cache'] = 'disconnected'
        health_status['cache_error'] = str(e)

    from django.utils import timezone
    health_status['timestamp'] = timezone.now().isoformat()

    status_code = 200 if health_status['status'] == 'healthy' else 503

    return JsonResponse(health_status, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    """
    API status endpoint that returns basic API information.
    """
    from django.utils import timezone

    return JsonResponse({
        'status': 'operational',
        'message': 'Happy Groceries API is running',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
    })
