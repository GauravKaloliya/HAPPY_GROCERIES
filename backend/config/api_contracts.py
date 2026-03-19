API_CONTRACTS = [
    {'path': '/health/', 'method': 'GET', 'auth_required': False, 'expected_statuses': {200, 503}},
    {'path': '/status/', 'method': 'GET', 'auth_required': False, 'expected_statuses': {200}},

    {'path': '/auth/register/', 'method': 'POST', 'auth_required': False, 'expected_statuses': {200, 201, 400}},
    {'path': '/auth/login/', 'method': 'POST', 'auth_required': False, 'expected_statuses': {200, 400, 401}},
    {'path': '/auth/logout/', 'method': 'POST', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/auth/refresh/', 'method': 'POST', 'auth_required': False, 'expected_statuses': {200, 400, 401}},
    {'path': '/auth/profile/', 'method': 'GET', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/auth/profile/', 'method': 'PATCH', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/auth/change-password/', 'method': 'POST', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/auth/stats/', 'method': 'GET', 'auth_required': True, 'expected_statuses': {401, 403}},

    {'path': '/products/', 'method': 'GET', 'auth_required': False, 'expected_statuses': {200}},
    {'path': '/products/featured/', 'method': 'GET', 'auth_required': False, 'expected_statuses': {200}},
    {'path': '/products/categories/', 'method': 'GET', 'auth_required': False, 'expected_statuses': {200}},

    {'path': '/cart/', 'method': 'GET', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/cart/add/', 'method': 'POST', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/cart/update_item/', 'method': 'POST', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/cart/remove_item/', 'method': 'POST', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/cart/clear/', 'method': 'POST', 'auth_required': True, 'expected_statuses': {401, 403}},

    {'path': '/orders/', 'method': 'GET', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/orders/', 'method': 'POST', 'auth_required': True, 'expected_statuses': {401, 403}},

    {'path': '/coupons/', 'method': 'GET', 'auth_required': False, 'expected_statuses': {200}},
    {'path': '/coupons/validate/', 'method': 'POST', 'auth_required': False, 'expected_statuses': {200, 400}},
    {'path': '/wishlist/', 'method': 'GET', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/wishlist/add/', 'method': 'POST', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/wishlist/remove/', 'method': 'POST', 'auth_required': True, 'expected_statuses': {401, 403}},

    {'path': '/reviews/my-reviews/', 'method': 'GET', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/reviews/pending/', 'method': 'GET', 'auth_required': True, 'expected_statuses': {401, 403}},
    {'path': '/config/all/', 'method': 'GET', 'auth_required': False, 'expected_statuses': {200}},
]
