# Happy Groceries API - Frontend Aligned

This is the optimized backend API for the Happy Groceries application, with routes aligned to match frontend requirements.

## 🎯 Overview

This API has been optimized to include only the endpoints that are actively used by the frontend application. All unused routes, admin-only features, and soft-delete management endpoints have been removed to reduce the API surface area and improve maintainability.

## 📚 Documentation

Visit the root URL (`/`) to view the interactive API documentation with all available endpoints, their methods, and descriptions.

## 🔒 Authentication

The API uses JWT (JSON Web Token) authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via the `/api/auth/login/` endpoint and can be refreshed using `/api/auth/refresh/`.

## 🛣️ API Endpoints

### Authentication (`/api/auth/`)

All authentication-related operations.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register/` | No | Register new user account |
| POST | `/login/` | No | Login and receive JWT tokens |
| POST | `/logout/` | Yes | Logout and blacklist tokens |
| POST | `/refresh/` | No | Refresh access token |
| GET | `/profile/` | Yes | Get user profile |
| PATCH | `/profile/` | Yes | Update user profile |
| POST | `/change-password/` | Yes | Change password |

### Products (`/api/products/`)

Browse and search products.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List products (supports filters: category, search, min_price, max_price, in_stock) |
| GET | `/{id}/` | No | Get product details |
| GET | `/categories/` | No | List all categories |
| GET | `/featured/` | No | Get featured products (rating >= 4.5) |
| GET | `/{id}/related/` | No | Get related products from same category |

### Categories (`/api/products/categories/`)

Category management.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List all categories |
| GET | `/{id}/` | No | Get category details |

### Shopping Cart (`/api/cart/`)

Manage user's shopping cart. **All endpoints require authentication.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get cart with totals, tax, and delivery charge |
| POST | `/add/` | Add item (product_id, quantity) |
| POST | `/update_item/` | Update quantity (item_id, quantity) |
| POST | `/remove_item/` | Remove item (item_id) |
| POST | `/clear/` | Clear entire cart |

**Cart Response includes:**
- Items with product details
- Subtotal
- Tax (8%)
- Delivery charge (₹0 for orders >= ₹500, ₹50 otherwise)
- Total

### Orders (`/api/orders/`)

Order management. **All endpoints require authentication.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List user's orders |
| GET | `/{id}/` | Get order details |
| POST | `/` | Create new order |

**Create Order Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 99.99
    }
  ],
  "delivery_name": "John Doe",
  "delivery_phone": "9876543210",
  "delivery_address": "123 Main St, City",
  "delivery_type": "standard",
  "subtotal": 199.98,
  "tax": 15.99,
  "delivery_charge": 50,
  "discount": 0,
  "total": 265.97,
  "coupon_code": "WELCOME10"
}
```

### Coupons (`/api/coupons/`)

Coupon and discount management.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List available coupons |
| GET | `/{id}/` | No | Get coupon details |
| POST | `/validate/` | No | Validate coupon (code, cart_total, cart_items) |
| POST | `/apply/` | Yes | Apply coupon to cart (code) |
| POST | `/remove/` | Yes | Remove applied coupon |
| POST | `/suggested/` | No | Get suggested coupons (cart_total, cart_items) |

**Validate Coupon Request:**
```json
{
  "code": "WELCOME10",
  "cart_total": 500,
  "cart_items": [...]
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Coupon is valid",
  "coupon": { ... },
  "potential_discount": 50
}
```

### Wishlist (`/api/wishlist/`)

User wishlist management. **All endpoints require authentication.**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's wishlist items |
| POST | `/add/` | Add product (product_id) |
| POST | `/remove/` | Remove product (product_id) |
| GET | `/{product_id}/check/` | Check if product is in wishlist |
| POST | `/clear/` | Clear entire wishlist |

## 🔧 Query Parameters

### Products Filtering

When calling `GET /api/products/`, you can use these query parameters:

- `category` - Filter by category name (e.g., `?category=Fruits`)
- `search` - Search in name, description, and category
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `in_stock` - Show only in-stock items (`?in_stock=true`)
- `ordering` - Sort by field: `name`, `price`, `rating`, `-price` (descending)

**Example:**
```
GET /api/products/?category=Fruits&min_price=10&max_price=100&ordering=-price
```

### Orders Filtering

When calling `GET /api/orders/`, you can use:

- `status` - Filter by order status
- `delivery_type` - Filter by delivery type

## 📦 Response Format

All responses follow a consistent format:

**Success Response:**
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2"
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

**List Response:**
```json
[
  { "id": 1, "name": "Item 1" },
  { "id": 2, "name": "Item 2" }
]
```

## 🚀 Security Features

- ✅ **Rate Limiting**: 100 requests per minute
- ✅ **SQL Injection Protection**: Parameterized queries
- ✅ **XSS Prevention**: Input sanitization
- ✅ **CSRF Protection**: Token validation
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **IP Blocking**: Automatic blocking of suspicious IPs
- ✅ **Request Validation**: Size and content validation
- ✅ **Security Headers**: CSP, HSTS, X-Frame-Options

## 🔄 API Versioning

Current version: **v3.0** (Frontend Aligned)

Previous versions removed unused endpoints. This version includes only:
- Endpoints actively used by the frontend
- Core business logic operations
- Essential user-facing features

## 💡 Best Practices

1. **Always check authentication** - Most endpoints require a valid JWT token
2. **Handle errors gracefully** - Check response status codes and error messages
3. **Use HTTPS in production** - Never send tokens over HTTP
4. **Refresh tokens before expiry** - Access tokens expire after 15 minutes
5. **Validate input on frontend** - Don't rely solely on backend validation

## 🐛 Common Issues

### 401 Unauthorized
- Token expired → Use refresh token endpoint
- Token invalid → Login again
- Missing Authorization header → Include Bearer token

### 400 Bad Request
- Missing required fields → Check request body
- Invalid data format → Validate input before sending
- Business logic violation → Read error message

### 404 Not Found
- Invalid endpoint → Check API documentation
- Resource doesn't exist → Verify ID/slug
- Soft-deleted resource → Cannot access deleted items

## 📞 Support

For API issues or questions:
1. Check this documentation
2. Review the interactive API docs at `/`
3. Check `API_CHANGES.md` for recent changes
4. Contact the development team

## 🎨 Frontend Integration

This API is designed to work seamlessly with the React frontend application located in `/frontend`. All endpoints match the frontend API client expectations in `/frontend/src/api/`.

## 📝 Changelog

See `API_CHANGES.md` for a detailed list of changes from previous versions.

---

**Happy Groceries API** © 2025 | Version 3.0
