import logging

from django.http import JsonResponse
from django.utils import timezone

from .request_context import get_request_id

logger = logging.getLogger('api_errors')


class GlobalErrorMiddleware:
    """Catch non-DRF unhandled errors and return unified API error payload."""

    API_PREFIXES = (
        '/auth/',
        '/products/',
        '/combos/',
        '/cart/',
        '/orders/',
        '/coupons/',
        '/wishlist/',
        '/activity-logs/',
        '/contact/',
        '/config/',
        '/reviews/',
        '/health/',
        '/status/',
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            return self.get_response(request)
        except Exception as exc:
            if not request.path.startswith(self.API_PREFIXES):
                raise

            request_id = getattr(request, 'request_id', get_request_id())
            logger.exception(
                'unhandled_exception path=%s method=%s request_id=%s',
                request.path,
                request.method,
                request_id,
            )
            return JsonResponse(
                {
                    'success': False,
                    'error': {
                        'code': 'internal_server_error',
                        'message': 'Internal server error',
                        'details': None,
                    },
                    'request_id': request_id,
                    'timestamp': timezone.now().isoformat(),
                },
                status=500,
            )
