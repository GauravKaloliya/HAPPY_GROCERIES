import logging
import time
import uuid

from django.http import HttpRequest, HttpResponse

from .request_context import set_request_id

logger = logging.getLogger('observability')


class ObservabilityMiddleware:
    """Inject request IDs and log incident-grade request telemetry."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        request_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())
        set_request_id(request_id)
        request.request_id = request_id

        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = int((time.monotonic() - start) * 1000)

        response['X-Request-ID'] = request_id
        response['X-Response-Time-Ms'] = str(duration_ms)

        status = response.status_code
        method = request.method
        path = request.path
        user_id = getattr(getattr(request, 'user', None), 'id', None)
        ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or request.META.get('REMOTE_ADDR', 'unknown')

        if status >= 500:
            logger.error(
                'server_error method=%s path=%s status=%s duration_ms=%s ip=%s user_id=%s',
                method,
                path,
                status,
                duration_ms,
                ip,
                user_id,
            )
        elif duration_ms >= 1000:
            logger.warning(
                'slow_request method=%s path=%s status=%s duration_ms=%s ip=%s user_id=%s',
                method,
                path,
                status,
                duration_ms,
                ip,
                user_id,
            )
        else:
            logger.info(
                'request method=%s path=%s status=%s duration_ms=%s ip=%s user_id=%s',
                method,
                path,
                status,
                duration_ms,
                ip,
                user_id,
            )

        return response
