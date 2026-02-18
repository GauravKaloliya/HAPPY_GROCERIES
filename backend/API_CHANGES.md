# API Changes - Frontend Aligned Routes

This document outlines the changes made to align the backend API with the frontend application requirements.

## Summary

Removed unused backend routes and kept only the endpoints that are actively used by the frontend application. This reduces API surface area, improves security, and makes the codebase more maintainable.

## Removed Endpoints

### Products
- ❌ `GET /api/products/statistics/` - Product statistics
- ❌ `POST /api/products/{id}/soft_delete/` - Soft delete product
- ❌ `POST /api/products/{id}/restore/` - Restore product
- ❌ `PATCH /api/products/{id}/update_stock/` - Update stock
- ❌ `PATCH /api/products/{id}/update_price/` - Update price
- ❌ `PATCH /api/products/{id}/update_discount/` - Update discount
- ❌ `PATCH /api/products/{id}/toggle_active/` - Toggle active status
- ❌ `GET /api/products/all_products/` - Get all products including deleted

### Categories
- ❌ `POST /api/products/categories/{id}/soft_delete/` - Soft delete category
- ❌ `POST /api/products/categories/{id}/restore/` - Restore category

### Cart
- ❌ `POST /api/cart/restore_item/` - Restore deleted cart item
- ❌ `GET /api/cart/count/` - Get cart item count
- ❌ `GET /api/cart/deleted_items/` - Get deleted items

### Orders
- ❌ `POST /api/orders/checkout/` - Replaced with `POST /api/orders/`
- ❌ `POST /api/orders/{id}/cancel/` - Cancel order
- ❌ `POST /api/orders/{id}/soft_delete/` - Soft delete order
- ❌ `POST /api/orders/{id}/restore/` - Restore order
- ❌ `GET /api/orders/statistics/` - Order statistics
- ❌ `GET /api/orders/active/` - Get active orders
- ❌ `GET /api/orders/past/` - Get past orders
- ❌ `GET /api/orders/all_orders/` - Get all orders including deleted
- ❌ `PATCH /api/orders/{id}/update_status/` - Update order status

### Coupons
- ❌ `GET /api/coupons/user_coupons/` - Get user's available coupons
- ❌ `GET /api/coupons/statistics/` - Coupon statistics
- ❌ `POST /api/coupons/{id}/soft_delete/` - Soft delete coupon
- ❌ `POST /api/coupons/{id}/restore/` - Restore coupon
- ❌ `PATCH /api/coupons/{id}/update_coupon/` - Update coupon
- ❌ `GET /api/coupons/all_coupons/` - Get all coupons including deleted

### Wishlist
- ❌ `GET /api/wishlist/count/` - Get wishlist count
- ❌ Standard REST methods (create, destroy) replaced with custom actions

## Added/Updated Endpoints

### Orders
- ✅ `POST /api/orders/` - Create order directly from provided data (replaces `/checkout/`)
  - Now accepts items array in request body instead of requiring cart

### Coupons
- ✅ `POST /api/coupons/apply/` - Apply coupon to cart (AUTH required)
- ✅ `POST /api/coupons/remove/` - Remove applied coupon (AUTH required)
- ✅ `POST /api/coupons/suggested/` - Get suggested coupons based on cart

### Wishlist
- ✅ `POST /api/wishlist/add/` - Add item to wishlist (replaces standard create)
- ✅ `POST /api/wishlist/remove/` - Remove item from wishlist (replaces standard destroy)
- ✅ `GET /api/wishlist/{product_id}/check/` - Check if product is in wishlist

## Kept Endpoints (Frontend-Used)

### Authentication (/api/auth/)
- ✅ `POST /register/` - User registration
- ✅ `POST /login/` - User login
- ✅ `POST /logout/` - User logout (AUTH)
- ✅ `POST /refresh/` - Refresh token
- ✅ `GET /profile/` - Get user profile (AUTH)
- ✅ `PATCH /profile/` - Update user profile (AUTH)
- ✅ `POST /change-password/` - Change password (AUTH)

### Products (/api/products/)
- ✅ `GET /` - List all products (with filters: category, search, min_price, max_price, in_stock)
- ✅ `GET /{id}/` - Get product by ID
- ✅ `GET /categories/` - List all categories
- ✅ `GET /featured/` - Get featured products (rating >= 4.5)
- ✅ `GET /{id}/related/` - Get related products (same category)

### Categories (/api/products/categories/)
- ✅ `GET /` - List all categories
- ✅ `GET /{id}/` - Get category by ID

### Cart (/api/cart/) - AUTH REQUIRED
- ✅ `GET /` - Get user's cart (includes totals, tax, delivery)
- ✅ `POST /add/` - Add item to cart
- ✅ `POST /update_item/` - Update item quantity
- ✅ `POST /remove_item/` - Remove item from cart
- ✅ `POST /clear/` - Clear all cart items

### Orders (/api/orders/) - AUTH REQUIRED
- ✅ `GET /` - List user's orders
- ✅ `GET /{id}/` - Get order details
- ✅ `POST /` - Create new order

### Coupons (/api/coupons/)
- ✅ `GET /` - List available coupons
- ✅ `GET /{id}/` - Get coupon details
- ✅ `POST /validate/` - Validate coupon code
- ✅ `POST /apply/` - Apply coupon (AUTH)
- ✅ `POST /remove/` - Remove coupon (AUTH)
- ✅ `POST /suggested/` - Get suggested coupons

### Wishlist (/api/wishlist/) - AUTH REQUIRED
- ✅ `GET /` - Get user's wishlist
- ✅ `POST /add/` - Add to wishlist
- ✅ `POST /remove/` - Remove from wishlist
- ✅ `GET /{product_id}/check/` - Check if in wishlist
- ✅ `POST /clear/` - Clear wishlist

## Breaking Changes

1. **Orders Creation**: `POST /api/orders/checkout/` → `POST /api/orders/`
   - Frontend already uses the correct endpoint
   - Backend now accepts items directly in request body

2. **Wishlist Check**: `GET /api/wishlist/check/?product_id={id}` → `GET /api/wishlist/{id}/check/`
   - More RESTful URL structure

## Benefits

1. **Reduced Attack Surface**: Fewer endpoints mean fewer potential security vulnerabilities
2. **Clearer API Contract**: Only documented endpoints that frontend actually uses
3. **Easier Maintenance**: Less code to maintain and test
4. **Better Documentation**: API docs now accurately reflect frontend usage
5. **Performance**: Removed unused code paths

## Migration Notes

- All soft delete and restore endpoints have been removed as they're not used by the frontend
- Admin/management operations (stock updates, price changes, etc.) should be done through Django Admin panel
- Statistics and reporting endpoints removed - implement as needed with proper analytics tools
- The frontend application will continue to work without any changes
