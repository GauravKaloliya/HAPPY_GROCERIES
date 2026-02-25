# Happy Groceries API Documentation

Base URL: `https://api.happygroceries.shop`

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Categories](#categories)
4. [Cart](#cart)
5. [Orders](#orders)
6. [Coupons](#coupons)
7. [Wishlist](#wishlist)
8. [Reviews](#reviews)
9. [Contact](#contact)
10. [Configuration](#configuration)
11. [Health Check](#health-check)

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header.

```
Authorization: Bearer <access_token>
```

### Endpoints

#### Register User
```
POST /api/auth/register/
```

**Request Body:**
```json
{
  "phone": "9876543210",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "phone": "9876543210",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_verified": false
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOi...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOi..."
}
```

#### Login
```
POST /api/auth/login/
```

**Request Body:**
```json
{
  "phone": "9876543210",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "user": {...},
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOi...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOi..."
}
```

#### Logout
```
POST /api/auth/logout/
```
**Authentication Required:** Yes

#### Refresh Token
```
POST /api/auth/refresh/
```
Uses HTTP-only cookie for refresh token.

#### Get Profile
```
GET /api/auth/profile/
```
**Authentication Required:** Yes

**Response:**
```json
{
  "id": 1,
  "phone": "9876543210",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "address": "123 Main Street",
  "date_joined": "2025-01-01T00:00:00Z"
}
```

#### Update Profile
```
PATCH /api/auth/profile/
```
**Authentication Required:** Yes

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "newemail@example.com",
  "address": "456 New Street"
}
```

#### Change Password
```
POST /api/auth/change-password/
```
**Authentication Required:** Yes

**Request Body:**
```json
{
  "old_password": "CurrentPass123",
  "new_password": "NewSecurePass456"
}
```

#### Check Phone Availability
```
GET /api/auth/check-phone/?phone=9876543210
```

**Response:**
```json
{
  "available": true,
  "message": "Phone number is available"
}
```

#### Check Email Availability
```
GET /api/auth/check-email/?email=user@example.com
```

**Response:**
```json
{
  "available": true,
  "message": "Email is available"
}
```

---

## Products

### List Products
```
GET /api/products/
```

**Query Parameters:**
- `search` - Search by name, description, or category
- `category` - Filter by category name
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `in_stock` - Filter for in-stock items (true/false)
- `ordering` - Sort by field (name, price, rating, created_at)
- `limit` - Limit number of results

**Response:**
```json
{
  "count": 6,
  "results": [
    {
      "id": 1,
      "name": "Apple",
      "price": "120.00",
      "effective_price": "108.00",
      "category": {
        "id": 1,
        "name": "Fruits",
        "emoji": "🍎"
      },
      "emoji": "🍎",
      "rating": "0.0",
      "reviews_count": 0,
      "stock": 25,
      "discount_percent": 10,
      "description": "Crisp, juicy apples...",
      "is_active": true
    }
  ]
}
```

### Get Product Details
```
GET /api/products/{id}/
```

**Response:**
```json
{
  "id": 1,
  "name": "Apple",
  "price": "120.00",
  "effective_price": "108.00",
  "category": {
    "id": 1,
    "name": "Fruits",
    "description": "Fresh fruits from local farms",
    "emoji": "🍎"
  },
  "emoji": "🍎",
  "rating": "0.0",
  "reviews_count": 0,
  "stock": 25,
  "discount_percent": 10,
  "description": "Crisp, juicy apples packed with fiber...",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Get Featured Products
```
GET /api/products/featured/
```

### Get Related Products
```
GET /api/products/{id}/related/
```

---

## Categories

### List Categories
```
GET /api/products/categories/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Fruits",
    "description": "Fresh fruits from local farms",
    "emoji": "🍎"
  },
  {
    "id": 2,
    "name": "Vegetables",
    "description": "Fresh vegetables for a healthy diet",
    "emoji": "🥕"
  }
]
```

---

## Cart

**All cart endpoints require authentication.**

### Get Cart
```
GET /api/cart/
```

**Response:**
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Apple",
        "price": "120.00",
        "emoji": "🍎"
      },
      "quantity": 2,
      "subtotal": "240.00"
    }
  ],
  "total": "240.00",
  "total_items": 2
}
```

### Add Item to Cart
```
POST /api/cart/add_item/
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

### Update Cart Item
```
PATCH /api/cart/{item_id}/
```

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove Item from Cart
```
DELETE /api/cart/{item_id}/
```

### Clear Cart
```
DELETE /api/cart/clear/
```

---

## Orders

**All order endpoints require authentication.**

### List Orders
```
GET /api/orders/
```

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "order_id": "HG12345678",
      "status": "delivered",
      "delivery_type": "standard",
      "subtotal": "500.00",
      "tax": "40.00",
      "delivery_charge": "0.00",
      "coupon_discount": "50.00",
      "total": "490.00",
      "delivery_name": "John Doe",
      "delivery_phone": "9876543210",
      "delivery_address": "123 Main Street",
      "items": [
        {
          "id": 1,
          "product_name": "Apple",
          "product_price": "120.00",
          "quantity": 2,
          "subtotal": "240.00"
        }
      ],
      "created_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

### Get Order Details
```
GET /api/orders/{id}/
```

### Create Order
```
POST /api/orders/
```

**Request Body:**
```json
{
  "delivery_name": "John Doe",
  "delivery_phone": "9876543210",
  "delivery_address": "123 Main Street, City",
  "delivery_instructions": "Leave at door",
  "delivery_type": "standard",
  "coupon_code": "SAVE20",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": "120.00"
    }
  ]
}
```

### Cancel Order
```
POST /api/orders/{id}/cancel/
```

---

## Coupons

### List Coupons
```
GET /api/coupons/
```

**Query Parameters:**
- `limit` - Limit number of results

**Response:**
```json
{
  "count": 6,
  "results": [
    {
      "id": 1,
      "code": "SAVE20",
      "description": "20% off orders above ₹500",
      "coupon_type": "percentage",
      "value": "20.00",
      "min_order_value": "500.00",
      "max_discount": "150.00",
      "applicable_categories": [],
      "first_order_only": false,
      "is_active": true,
      "valid_from": "2025-01-01T00:00:00Z",
      "valid_until": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Validate Coupon
```
POST /api/coupons/validate/
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "cart_total": "600.00"
}
```

**Response:**
```json
{
  "valid": true,
  "discount": "120.00",
  "message": "Coupon applied successfully!"
}
```

---

## Wishlist

**All wishlist endpoints require authentication.**

### Get Wishlist
```
GET /api/wishlist/
```

### Add to Wishlist
```
POST /api/wishlist/
```

**Request Body:**
```json
{
  "product_id": 1
}
```

### Remove from Wishlist
```
DELETE /api/wishlist/{product_id}/
```

### Check if Product is in Wishlist
```
GET /api/wishlist/check/{product_id}/
```

**Response:**
```json
{
  "is_in_wishlist": true
}
```

---

## Reviews

**All review endpoints require authentication.**

### List Reviews for a Product
```
GET /api/reviews/?product_id=1
```

### Create Review
```
POST /api/reviews/
```

**Request Body:**
```json
{
  "product_id": 1,
  "order_id": 1,
  "rating": 5,
  "title": "Great product!",
  "comment": "Fresh and delicious apples"
}
```

### Update Review
```
PATCH /api/reviews/{id}/
```

### Delete Review
```
DELETE /api/reviews/{id}/
```

### Mark Review as Helpful
```
POST /api/reviews/{id}/helpful/
```

---

## Contact

### Submit Contact Message
```
POST /api/contact/
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question about my order"
}
```

---

## Configuration

### Get Site Configuration
```
GET /api/config/
```

**Response:**
```json
{
  "tax_rate": "0.0800",
  "standard_delivery_charge": "40.00",
  "express_delivery_charge": "50.00",
  "free_delivery_threshold": "500.00",
  "site_name": "Happy Groceries",
  "site_currency": "₹"
}
```

### Get Sort Options
```
GET /api/config/sort-options/
```

---

## Health Check

### Basic Health Check
```
GET /health/
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### API Status
```
GET /api/status/
```

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "details": {
    "phone": ["This field is required"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication credentials were not provided"
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

API requests are rate-limited to 100 requests per 60 seconds per IP address. If you exceed the limit, you will receive a 429 Too Many Requests response.

---

## CORS

Allowed origins:
- `https://happygroceries.shop`
- `https://www.happygroceries.shop`
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)

Credentials are allowed for all requests.
