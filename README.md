# Happy Groceries - Full Stack E-Commerce Application

A modern, full-stack e-commerce grocery store built with **React** (frontend), **Django REST Framework** (backend), and **PostgreSQL** (database).

## 🎉 Migration Complete!

This project has been successfully migrated from vanilla HTML/CSS/JS to a modern React + Django REST architecture while preserving all original features and UI/UX.

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────────┐      ┌──────────────┐
│   React     │──────│  Django REST    │──────│  PostgreSQL  │
│  Frontend   │      │     API         │      │   Database   │
└─────────────┘      └─────────────────┘      └──────────────┘
```

## ✨ Features

### Frontend (React)
- **Modern React 18** with hooks and functional components
- **React Router v6** for client-side routing
- **Context API** for state management (Auth, Cart, Theme)
- **Axios** for API communication with JWT authentication
- **Responsive design** with CSS Grid and Flexbox
- **Dark mode** support with CSS variables
- **Toast notifications** for user feedback

### Backend (Django REST)
- **Django 4.2** with Django REST Framework
- **JWT Authentication** using SimpleJWT
- **CORS** support for cross-origin requests
- **Modular architecture** with separate apps:
  - `accounts` - User authentication and management
  - `products` - Categories and products
  - `cart` - Shopping cart functionality
  - `orders` - Order management
  - `coupons` - Coupon and discount system
  - `wishlist` - User wishlists

### Database (PostgreSQL)
- All 74 products with complete details
- 5 categories (Fruits, Vegetables, Dairy, Snacks, Beverages)
- 5 coupon types with various discount rules
- User accounts and order history

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create PostgreSQL database:
```bash
createdb happy_groceries
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Seed the database:
```bash
python seed_data.py
```

7. Create superuser (optional):
```bash
python manage.py createsuperuser
```

8. Run the server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login/` - Login with phone/password, returns JWT tokens
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user info
- `PATCH /api/auth/me/update/` - Update user profile
- `POST /api/auth/logout/` - Logout user

### Products Endpoints
- `GET /api/products/` - List all products (with filters)
- `GET /api/products/featured/` - Get featured products
- `GET /api/products/search/` - Search products
- `GET /api/products/<id>/` - Get product details
- `GET /api/products/categories/` - List categories
- `GET /api/products/categories/<id>/products/` - Products by category

### Cart Endpoints
- `GET /api/cart/` - Get user's cart
- `POST /api/cart/add/` - Add item to cart
- `PATCH /api/cart/items/<id>/` - Update item quantity
- `DELETE /api/cart/items/<id>/delete/` - Remove item
- `DELETE /api/cart/clear/` - Clear cart

### Orders Endpoints
- `GET /api/orders/` - List user's orders
- `POST /api/orders/create/` - Create new order
- `GET /api/orders/<id>/` - Get order details
- `GET /api/orders/stats/` - Get order statistics

### Coupons Endpoints
- `GET /api/coupons/` - List available coupons
- `POST /api/coupons/validate/` - Validate coupon code
- `GET /api/coupons/suggested/` - Get smart coupon suggestions
- `GET /api/coupons/recommendation/` - Get top recommendation

### Wishlist Endpoints
- `GET /api/wishlist/` - Get user's wishlist
- `POST /api/wishlist/add/` - Add to wishlist
- `POST /api/wishlist/toggle/` - Toggle wishlist item
- `DELETE /api/wishlist/<product_id>/` - Remove from wishlist

## 🎨 UI Features Preserved

All original UI features have been preserved in the migration:

- **Hero section** with floating emoji animations
- **Product cards** with discounts, ratings, and wishlist
- **Category cards** with color coding
- **Shopping cart** with quantity controls
- **Coupon system** with smart recommendations
- **Dark mode** toggle with CSS variables
- **Responsive design** for all screen sizes
- **Toast notifications** for user feedback
- **Form validation** and error handling

## 📁 Project Structure

```
project/
├── backend/                  # Django REST API
│   ├── accounts/            # User authentication
│   ├── products/            # Products and categories
│   ├── cart/                # Shopping cart
│   ├── orders/              # Order management
│   ├── coupons/             # Coupon system
│   ├── wishlist/            # User wishlists
│   ├── happy_groceries/     # Project settings
│   ├── manage.py
│   ├── requirements.txt
│   └── seed_data.py         # Database seeder
│
├── frontend/                # React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS files
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── css/                    # Original CSS (legacy)
├── js/                     # Original JS (legacy)
├── pages/                  # Original HTML (legacy)
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/happy_groceries
ALLOWED_HOSTS=*
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend (Django)
1. Set `DEBUG=False` in settings
2. Configure production database
3. Run `python manage.py collectstatic`
4. Use Gunicorn/WSGI server

### Frontend (React)
1. Run `npm run build`
2. Serve the `build/` folder with Nginx/Apache

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Original vanilla JS implementation by the Happy Groceries team
- Migration to React + Django REST for modern scalability
