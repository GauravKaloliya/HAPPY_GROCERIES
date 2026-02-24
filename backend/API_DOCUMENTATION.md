# Happy Groceries API Documentation

Complete API documentation for the Happy Groceries e-commerce platform.

---

## Base URL
```
https://api.happygroceries.shop/api
```

---

## Authentication

### Register
```http
POST /api/auth/register/
Content-Type: application/json

{
  "phone": "9876543210",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "phone": "9876543210",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "phone": "9876543210",
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Logout
```http
POST /api/auth/logout/
Authorization: Bearer {access_token}
```

### Refresh Token
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Products

### Get All Products
```http
GET /api/products/
Authorization: Bearer {access_token}

Query Parameters:
- page: Page number (default: 1)
- page_size: Items per page (default: 20, max: 100)
- category: Filter by category name (e.g., "Fruits")
- brand: Filter by brand name (e.g., "Amul")
- unit: Filter by unit type (e.g., "kg", "g", "ltr", "ml", "piece")
- is_veg: "true" or "false" (vegetarian filter)
- is_organic: "true" or "false" (organic filter)
- is_fresh: "true" or "false" (fresh produce filter)
- search: Search in product name (case-insensitive)
- ordering: Sort order (e.g., "name", "price", "-price", "rating", "created_at")
- min_price: Minimum price filter
- max_price: Maximum price filter
- in_stock: "true" or "false" (in stock filter)

Response:
```json
{
  "count": 74,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Apple",
      "price": "185.00",
      "mrp": "230.00",
      "unit": "kg",
      "pack_size": "1.00",
      "category": {
        "id": 1,
        "name": "Fruits",
        "emoji": "🍎",
        "color": "var(--primary-pink)"
      },
      "brand": {
        "id": 1,
        "name": "fresho!"
      },
      "gst_rate": "0.00",
      "hsn_code": null,
      "is_veg": true,
      "is_organic": false,
      "is_fresh": true,
      "emoji": "🍎",
      "rating": "0.0",
      "reviews_count": 0,
      "stock": 60,
      "discount_percent": 20,
      "description": "Crisp, juicy apples packed with fiber and natural sweetness.",
      "is_active": true
    }
  ]
}
```

### Get Product by ID
```http
GET /api/products/{id}/
Authorization: Bearer {access_token}

Response:
```json
{
  "id": 1,
  "name": "Apple",
  "price": "185.00",
  "mrp": "230.00",
  "unit": "kg",
  "pack_size": "1.00",
  "category": {
    "id": 1,
    "name": "Fruits",
    "emoji": "🍎",
    "color": "var(--primary-pink)"
  },
  "brand": {
    "id": 1,
    "name": "fresho!"
  },
  "gst_rate": "0.00",
  "hsn_code": null,
  "is_veg": true,
  "is_organic": false,
  "is_fresh": true,
  "emoji": "🍎",
  "rating": "0.0",
  "reviews_count": 0,
  "stock": 60,
  "discount_percent": 20,
  "description": "Crisp, juicy apples packed with fiber and natural sweetness.",
  "is_active": true
}
```

### Get Categories
```http
GET /api/products/categories/
Authorization: Bearer {access_token}

Response:
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "Fruits",
      "description": "Fresh fruits from local farms",
      "emoji": "🍎",
      "color": "var(--primary-pink)"
    },
    {
      "id": 2,
      "name": "Vegetables",
      "description": "Fresh vegetables for a healthy diet",
      "emoji": "🥕",
      "color": "var(--primary-green)"
    },
    {
      "id": 3,
      "name": "Dairy",
      "description": "Dairy products including milk, cheese, and more",
      "emoji": "🥛",
      "color": "var(--primary-blue)"
    },
    {
      "id": 4,
      "name": "Snacks",
      "description": "Delicious snacks for every mood",
      "emoji": "🍪",
      "color": "var(--primary-orange)"
    },
    {
      "id": 5,
      "name": "Beverages",
      "description": "Refreshing drinks and beverages",
      "emoji": "🧃",
      "color": "var(--primary-purple)"
    }
  ]
}
```

### Get Brands
```http
GET /api/products/brands/
Authorization: Bearer {access_token}

Response:
```json
{
  "count": 11,
  "results": [
    {
      "id": 1,
      "name": "fresho!",
      "slug": "fresho",
      "description": "BigBasket own fresh produce",
      "logo": null,
      "is_active": true
    },
    {
      "id": 2,
      "name": "Amul",
      "slug": "amul",
      "description": "Leading Indian dairy brand",
      "logo": null,
      "is_active": true
    }
  ]
}
```

### Get Related Products
```http
GET /api/products/{id}/related/
Authorization: Bearer {access_token}

Response:
```json
{
  "results": [
    // Up to 4 related products
  ]
}
```

### Get Featured Products
```http
GET /api/products/featured/
Authorization: Bearer {access_token}

Response:
```json
{
  "results": [
    // Up to 8 featured products (high rating, high discount)
  ]
}
```

---

## Cart

### Get Cart
```http
GET /api/cart/
Authorization: Bearer {access_token}

Response:
```json
{
  "id": 1,
  "user": 1,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Apple",
        "price": "185.00",
        "mrp": "230.00",
        "unit": "kg",
        "pack_size": "1.00"
      },
      "quantity": 2,
      "added_at": "2026-02-24T00:00:00Z"
    }
  ],
  "tax": 0.00,
  "delivery": 35.00,
  "total": 405.00
}
```

### Add Item to Cart
```http
POST /api/cart/add/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

### Update Cart Item Quantity
```http
POST /api/cart/update_item/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "item_id": 1,
  "quantity": 3
}
```

### Remove Item from Cart
```http
POST /api/cart/remove_item/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "item_id": 1
}
```

### Clear Cart
```http
POST /api/cart/clear/
Authorization: Bearer {access_token}
```

---

## Orders

### Get All Orders
```http
GET /api/orders/
Authorization: Bearer {access_token}

Query Parameters:
- status: Filter by status (pending, confirmed, processing, shipped, delivered, cancelled)
- delivery_type: Filter by delivery type (standard, express)

Response:
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "order_id": "HG20250224000001",
      "user": 1,
      "status": "delivered",
      "delivery_type": "standard",
      "subtotal": "405.00",
      "tax": "0.00",
      "applied_discount_amount": "45.00",
      "delivery_charge": "35.00",
      "coupon_discount": "0.00",
      "total": "395.00",
      "delivery_name": "John Doe",
      "delivery_phone": "9876543210",
      "delivery_address": "123 Main St, Ahmedabad",
      "delivery_instructions": "",
      "estimated_delivery": "2026-02-24T11:30:00Z",
      "delivered_at": "2026-02-24T11:45:00Z",
      "created_at": "2026-02-24T10:00:00Z",
      "items": [
        {
          "id": 1,
          "product_name": "Apple",
          "product_price": "185.00",
          "product_emoji": "🍎",
          "quantity": 2,
          "discount_percent": 20,
          "applied_discount_amount": "45.00",
          "subtotal": "370.00"
        }
      ]
    }
  ]
}
```

### Create Order
```http
POST /api/orders/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": "185.00"
    }
  ],
  "delivery_name": "John Doe",
  "delivery_phone": "9876543210",
  "delivery_address": "123 Main St, Ahmedabad",
  "city": "Ahmedabad",
  "delivery_type": "standard",
  "coupon_code": "SAVE20",
  "subtotal": "370.00",
  "tax": "0.00",
  "applied_discount_amount": "45.00",
  "delivery_charge": "35.00",
  "coupon_discount": "0.00",
  "total": "360.00"
}
```

---

## Coupons

### Get All Coupons
```http
GET /api/coupons/
Authorization: Bearer {access_token}

Response:
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "code": "SAVE20",
      "description": "20% off orders above ₹500",
      "coupon_type": "percentage",
      "value": "20.00",
      "min_order_value": "500.00",
      "max_discount": "120.00",
      "applicable_categories": [],
      "first_order_only": false,
      "is_active": true,
      "valid_from": "2026-02-24T00:00:00Z",
      "valid_until": "2027-02-24T00:00:00Z",
      "usage_count": 45
    }
  ]
}
```

### Validate Coupon
```http
POST /api/coupons/validate/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "SAVE20",
  "cart_total": "600.00"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Coupon is valid",
  "coupon": {
    "id": 1,
    "code": "SAVE20",
    "coupon_type": "percentage",
    "value": "20.00",
    "potential_discount": "120.00"
  }
}
```

### Apply Coupon
```http
POST /api/coupons/apply/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "SAVE20"
}
```

### Remove Coupon
```http
POST /api/coupons/remove/
Authorization: Bearer {access_token}
```

### Get Suggested Coupons
```http
POST /api/coupons/suggested/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "cart_total": "600.00"
}
```

---

## Wishlist

### Get Wishlist
```http
GET /api/wishlist/
Authorization: Bearer {access_token}

Response:
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Apple",
        "price": "185.00",
        "mrp": "230.00",
        "emoji": "🍎",
        "category": {
          "id": 1,
          "name": "Fruits",
          "emoji": "🍎"
        },
        "is_active": true
      },
      "created_at": "2026-02-24T10:00:00Z"
    }
  ]
}
```

### Add to Wishlist
```http
POST /api/wishlist/add/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "product_id": 1
}
```

### Remove from Wishlist
```http
POST /api/wishlist/remove/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "product_id": 1
}
```

### Check if Product in Wishlist
```http
GET /api/wishlist/check/{id}/
Authorization: Bearer {access_token}

Response:
```json
{
  "is_in_wishlist": true
}
```

### Clear Wishlist
```http
POST /api/wishlist/clear/
Authorization: Bearer {access_token}
```

---

## Reviews

### Get Product Reviews
```http
GET /api/reviews/product/{product_id}/
Authorization: Bearer {access_token}

Response:
```json
{
  "count": 25,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "phone": "9876543210"
      },
      "product": {
        "id": 1,
        "name": "Apple"
      },
      "rating": 4.5,
      "title": "Great apples!",
      "comment": "Very fresh and tasty. Will buy again.",
      "is_approved": true,
      "is_verified_purchase": true,
      "helpful_votes_count": 12,
      "created_at": "2026-02-20T15:30:00Z",
      "updated_at": "2026-02-20T15:30:00Z"
    }
  ]
}
```

### Get Review Summary
```http
GET /api/reviews/product/{product_id}/summary/
Authorization: Bearer {access_token}

Response:
```json
{
  "average_rating": 4.5,
  "total_reviews": 25,
  "rating_breakdown": {
    "1": 2,
    "2": 5,
    "3": 10,
    "4": 6,
    "5": 2
  },
  "can_review": true,
  "user_review": null
}
```

### Create Review
```http
POST /api/reviews/product/{product_id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rating": 5,
  "title": "Great apples!",
  "comment": "Very fresh and tasty."
}
```

### Update Review
```http
PATCH /api/reviews/{review_id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rating": 4,
  "title": "Good apples",
  "comment": "Updated review"
}
```

### Delete Review
```http
DELETE /api/reviews/{review_id}/
Authorization: Bearer {access_token}
```

### Mark Review as Helpful
```http
POST /api/reviews/{review_id}/helpful/
Authorization: Bearer {access_token}

Response:
```json
{
  "message": "Review marked as helpful",
  "helpful_count": 13
}
```

### Get My Reviews
```http
GET /api/reviews/my-reviews/
Authorization: Bearer {access_token}

Response:
```json
{
  "results": [
    // All reviews by the current user
  ]
}
```

### Get Pending Reviews
```http
GET /api/reviews/pending/
Authorization: Bearer {access_token}

Response:
```json
{
  "results": [
    // Products that user has purchased but not reviewed
  ]
}
```

---

## Contact Messages

### Get Contact Messages
```http
GET /api/contact/messages/
Authorization: Bearer {access_token}

Response:
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Great service!",
      "status": "resolved",
      "created_at": "2026-02-20T10:00:00Z"
    }
  ]
}
```

### Submit Contact Message
```http
POST /api/contact/messages/submit/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question about my order."
}
```

---

## Activity Logs

### Get Activity Logs
```http
GET /api/activity-logs/
Authorization: Bearer {access_token}

Query Parameters:
- page: Filter by page name
- action: Filter by action (page_view, product_view, add_to_cart, etc.)
- days: Filter by last N days
- page_size: Items per page (default: 20)

Response:
```json
{
  "count": 150,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "phone": "9876543210"
      },
      "action": "product_view",
      "page": "product_details",
      "details": {
        "product_id": 1,
        "product_name": "Apple"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-02-24T12:00:00Z"
    }
  ]
}
```

### Log Activity
```http
POST /api/activity-logs/log_activity/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "action": "product_view",
  "page": "product_details",
  "details": {
    "product_id": 1,
    "product_name": "Apple"
  }
}
```

### Get Activity Statistics
```http
GET /api/activity-logs/statistics/
Authorization: Bearer {access_token}

Response:
```json
{
  "total_activities": 500,
  "by_action": {
    "page_view": 150,
    "product_view": 120,
    "add_to_cart": 45,
    "checkout": 10
  },
  "by_page": {
    "shop": 200,
    "product_details": 120,
    "cart": 80,
    "checkout": 20,
    "orders": 30
  }
}
```

---

## Config

### Get Site Settings
```http
GET /api/config/settings/
Authorization: Bearer {access_token}

Response:
```json
{
  "id": 1,
  "tax_rate": "0.00",
  "standard_delivery_charge": "35.00",
  "express_delivery_charge": "49.00",
  "free_delivery_threshold": "499.00",
  "site_name": "HappyGroceries",
  "site_currency": "₹"
}
```

### Get Sort Options
```http
GET /api/config/sort-options/
Authorization: Bearer {access_token}

Response:
```json
{
  "results": [
    {
      "value": "popular",
      "label": "Most Popular",
      "order": 1,
      "is_active": true
    },
    {
      "value": "price_low",
      "label": "Price: Low to High",
      "order": 2,
      "is_active": true
    },
    {
      "value": "price_high",
      "label": "Price: High to Low",
      "order": 3,
      "is_active": true
    },
    {
      "value": "rating",
      "label": "Highest Rated",
      "order": 4,
      "is_active": true
    },
    {
      "value": "newest",
      "label": "Newest First",
      "order": 5,
      "is_active": true
    }
  ]
}
```

### Get All Config
```http
GET /api/config/all/
Authorization: Bearer {access_token}

Response:
```json
{
  "settings": {
    "id": 1,
    "tax_rate": "0.00",
    "standard_delivery_charge": "35.00",
    "express_delivery_charge": "49.00",
    "free_delivery_threshold": "499.00",
    "site_name": "HappyGroceries",
    "site_currency": "₹"
  },
  "sort_options": [
    // Sort options array
  ]
}
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message",
  "detail": "More detailed error information"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content returned
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not allowed
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Request well-formed but semantic errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- **Limit**: 100 requests per minute
- **Window**: 60 seconds
- **Block Duration**: 300 seconds (5 minutes)

When rate limit is exceeded, all requests will receive a `429 Too Many Requests` response.

---

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer {access_token}
```

Tokens are obtained from the `/api/auth/login/` endpoint.

Access tokens expire in 30 minutes.
Refresh tokens expire in 7 days.

---

## Pagination

List endpoints use cursor-based pagination:

**Request:**
```json
{
  "page": 1,
  "page_size": 20
}
```

**Response:**
```json
{
  "count": 74,
  "next": "http://api.happygroceries.shop/api/products/?page=2",
  "previous": null,
  "results": []
}
```

---

## Product Fields

### Product Object
```typescript
interface Product {
  id: number;
  name: string;
  price: string; // Selling/discounted price
  mrp: string; // Maximum Retail Price
  unit: "kg" | "g" | "mg" | "ltr" | "ml" | "piece" | "pack" | "dozen" | "bunch" | "bottle" | "can" | "box" | "jar" | "other";
  pack_size: number; // Numerical pack size
  category: Category;
  brand: Brand | null;
  brand_name: string; // Denormalized brand name
  gst_rate: "0.00" | "0.25" | "5.00" | "12.00" | "18.00" | "28.00";
  hsn_code: string | null;
  is_veg: boolean;
  is_organic: boolean;
  is_fresh: boolean;
  emoji: string;
  rating: number; // 0.0 to 5.0
  reviews_count: number;
  stock: number;
  discount_percent: number; // Calculated from mrp - price
  description: string;
  is_active: boolean;
}
```

### Category Object
```typescript
interface Category {
  id: number;
  name: string;
  description: string;
  emoji: string;
  color: string;
}
```

### Brand Object
```typescript
interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  is_active: boolean;
}
```

---

## Calculations

### Product Discount
```javascript
discount_percent = Math.round((1 - price / mrp) * 100)
```

### Cart Totals
```javascript
subtotal = sum(product.price * quantity)
tax = subtotal * tax_rate
delivery_charge = subtotal >= free_delivery_threshold ? 0 : standard_delivery_charge
total = subtotal + tax + delivery_charge - coupon_discount
```

### Applied Discount Amount
```javascript
applied_discount_amount = sum((product.mrp - product.price) * quantity)
```

---

## Notes

1. All prices are in INR (₹)
2. All timestamps are in UTC
3. All IDs are integers
4. Product prices are displayed with 2 decimal places
5. Ratings are displayed with 1 decimal place
6. Stock is tracked at the product level
7. Soft delete is implemented - deleted items are not returned by default
8. Users can only review products they have purchased
9. Reviews require admin approval before being displayed
