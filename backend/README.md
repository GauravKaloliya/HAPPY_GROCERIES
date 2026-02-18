# Happy Groceries Backend 🛒

Django REST API for the Happy Groceries e-commerce application.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication
- **RESTful API** - Complete REST API with Django REST Framework
- **PostgreSQL Database** - Production-ready Neon PostgreSQL
- **CORS Support** - Cross-origin requests enabled for frontend
- **Whitenoise** - Static file serving for production

## 📋 Requirements

- Python 3.9+
- PostgreSQL (Neon PostgreSQL is pre-configured)
- pip

## 🛠️ Setup

### Local Development

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set environment variables:**
```bash
export SECRET_KEY=your-secret-key-here
export DEBUG=True
export CORS_ALLOW_ALL_ORIGINS=True
```

4. **Run migrations:**
```bash
python manage.py migrate
```

5. **Seed the database:**
```bash
python seed_data.py
```

6. **Run server:**
```bash
python manage.py runserver
```

Server runs at: http://localhost:8000

### Production Deployment (Vercel)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Set environment variables in Vercel Dashboard:**
   - Go to Project Settings > Environment Variables
   - Add:
     - `SECRET_KEY` - A secure random string
     - `DEBUG` = `False`
     - `CORS_ALLOW_ALL_ORIGINS` = `True`

## 🗄️ Database

The database is pre-configured with Neon PostgreSQL. The connection URL is hardcoded in `settings.py`.

### Seeding Data

To populate the database with products and coupons:

```bash
python seed_data.py
```

This creates:
- 5 Categories (Fruits, Vegetables, Dairy, Snacks, Beverages)
- 74 Products with emojis, ratings, and descriptions
- 5 Coupons for discounts

## 📊 Models

| Model | Description |
|-------|-------------|
| **User** | Custom user model with phone authentication |
| **Category** | Product categories |
| **Product** | 74 grocery products with details |
| **Cart** | User shopping cart |
| **CartItem** | Items in cart |
| **Order** | User orders |
| **OrderItem** | Items in orders |
| **Coupon** | Discount coupons |
| **UsedCoupon** | Track used coupons |
| **Wishlist** | User wishlists |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login/` - Obtain JWT token pair
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/auth/register/` - Register new user
- `GET /api/auth/me/` - Get current user
- `PATCH /api/auth/me/update/` - Update profile
- `POST /api/auth/change-password/` - Change password
- `POST /api/auth/logout/` - Logout user

### Products
- `GET /api/products/` - List all products
- `GET /api/products/featured/` - Get featured products
- `GET /api/products/search/?q=query` - Search products
- `GET /api/products/categories/` - List categories
- `GET /api/products/categories/:id/products/` - Products by category
- `GET /api/products/:id/` - Get product details

### Cart
- `GET /api/cart/` - Get user's cart
- `POST /api/cart/add/` - Add item to cart
- `POST /api/cart/items/` - Create cart item
- `PATCH /api/cart/items/:id/` - Update item quantity
- `DELETE /api/cart/items/:id/delete/` - Remove item
- `DELETE /api/cart/clear/` - Clear cart

### Orders
- `GET /api/orders/` - List user orders
- `POST /api/orders/create/` - Create order
- `GET /api/orders/:id/` - Get order details
- `GET /api/orders/stats/` - Get order statistics

### Coupons
- `GET /api/coupons/` - List available coupons
- `POST /api/coupons/validate/` - Validate coupon code
- `GET /api/coupons/suggested/` - Get smart coupon suggestions
- `GET /api/coupons/recommendation/` - Get top recommendation

### Wishlist
- `GET /api/wishlist/` - Get user's wishlist
- `POST /api/wishlist/add/` - Add to wishlist
- `POST /api/wishlist/toggle/` - Toggle wishlist item
- `DELETE /api/wishlist/:product_id/` - Remove from wishlist
- `GET /api/wishlist/:product_id/check/` - Check if in wishlist

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | (required) |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Allowed hosts | `*` |
| `CORS_ALLOW_ALL_ORIGINS` | Allow all CORS origins | `True` |
| `CORS_ALLOWED_ORIGINS` | Specific CORS origins | - |

## 📝 License

MIT License
