# Happy Groceries Backend

Django REST API for the Happy Groceries e-commerce application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create PostgreSQL database:
```bash
createdb happy_groceries
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Seed the database:
```bash
python seed_data.py
```

5. Run server:
```bash
python manage.py runserver
```

## Models

- **User** - Custom user model with phone authentication
- **Category** - Product categories (Fruits, Vegetables, Dairy, Snacks, Beverages)
- **Product** - 74 grocery products with details
- **Cart/CartItem** - Shopping cart functionality
- **Order/OrderItem** - Order management
- **Coupon/UsedCoupon** - Discount system
- **Wishlist** - User wishlists

## API Endpoints

See main README for full API documentation.
