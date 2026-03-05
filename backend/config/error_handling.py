from rest_framework import status
from rest_framework.exceptions import APIException


class AppAPIException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Request failed'
    default_code = 'bad_request'

    def __init__(self, detail=None, code=None, extra=None):
        payload = {
            'message': str(detail or self.default_detail),
            'code': code or self.default_code,
        }
        if extra is not None:
            payload['details'] = extra
        super().__init__(payload, code=code or self.default_code)


class BadRequestError(AppAPIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Bad request'
    default_code = 'bad_request'


class UnauthorizedError(AppAPIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Unauthorized'
    default_code = 'unauthorized'


class ForbiddenError(AppAPIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Forbidden'
    default_code = 'forbidden'


class NotFoundError(AppAPIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found'
    default_code = 'not_found'


class ConflictError(AppAPIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Conflict'
    default_code = 'conflict'


class ServiceUnavailableError(AppAPIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Service unavailable'
    default_code = 'service_unavailable'
