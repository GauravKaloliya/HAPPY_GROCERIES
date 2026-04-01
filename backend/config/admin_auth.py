from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from rest_framework.permissions import BasePermission


ADMIN_AUTH_HEADER = 'HTTP_X_ADMIN_TOKEN'
ADMIN_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 12
ADMIN_TOKEN_SALT = 'happy-grocery-admin-panel'


def get_admin_username():
    return 'admin'


def get_admin_password():
    return 'admin'


def issue_admin_token():
    signer = TimestampSigner(salt=ADMIN_TOKEN_SALT)
    return signer.sign(get_admin_username())


def validate_admin_token(token, max_age=ADMIN_TOKEN_MAX_AGE_SECONDS):
    if not token:
        return False

    signer = TimestampSigner(salt=ADMIN_TOKEN_SALT)
    try:
        username = signer.unsign(token, max_age=max_age)
    except (BadSignature, SignatureExpired):
        return False

    return username == get_admin_username()


def get_request_admin_token(request):
    return request.META.get(ADMIN_AUTH_HEADER) or request.headers.get('X-Admin-Token')


def is_admin_request(request):
    return validate_admin_token(get_request_admin_token(request))


class IsAdminPanelAuthenticated(BasePermission):
    message = 'Admin authentication required.'

    def has_permission(self, request, view):
        return is_admin_request(request)
