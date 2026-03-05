import logging

from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    MethodNotAllowed,
    NotAuthenticated,
    NotFound,
    ParseError,
    PermissionDenied,
    Throttled,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler

from .request_context import get_request_id

logger = logging.getLogger('api_errors')


def _normalize_error(exc, response):
    if isinstance(exc, ValidationError):
        return status.HTTP_400_BAD_REQUEST, 'validation_error', 'Validation failed', response.data
    if isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        return status.HTTP_401_UNAUTHORIZED, 'unauthorized', 'Authentication required', response.data
    if isinstance(exc, PermissionDenied):
        return status.HTTP_403_FORBIDDEN, 'forbidden', 'Access denied', response.data
    if isinstance(exc, NotFound):
        return status.HTTP_404_NOT_FOUND, 'not_found', 'Resource not found', response.data
    if isinstance(exc, MethodNotAllowed):
        return status.HTTP_405_METHOD_NOT_ALLOWED, 'method_not_allowed', 'Method not allowed', response.data
    if isinstance(exc, Throttled):
        return status.HTTP_429_TOO_MANY_REQUESTS, 'rate_limited', 'Too many requests', response.data
    if isinstance(exc, ParseError):
        return status.HTTP_400_BAD_REQUEST, 'parse_error', 'Malformed request payload', response.data
    if isinstance(exc, APIException):
        detail = response.data
        if isinstance(detail, dict) and {'message', 'code'}.issubset(detail.keys()):
            return response.status_code, detail['code'], detail['message'], detail.get('details')
        return response.status_code, 'api_error', str(exc.detail), response.data
    return status.HTTP_500_INTERNAL_SERVER_ERROR, 'internal_server_error', 'Internal server error', None


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    request_id = get_request_id()

    view = context.get('view')
    request = context.get('request')
    view_name = view.__class__.__name__ if view else 'unknown'
    path = request.path if request else 'unknown'

    logger.error(
        'api_exception view=%s path=%s request_id=%s error=%s',
        view_name,
        path,
        request_id,
        str(exc),
    )

    if response is None:
        response = Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    status_code, error_code, message, details = _normalize_error(exc, response)
    response.status_code = status_code
    response.data = {
        'success': False,
        'error': {
            'code': error_code,
            'message': message,
            'details': details,
        },
        'request_id': request_id,
        'timestamp': timezone.now().isoformat(),
    }

    return response
