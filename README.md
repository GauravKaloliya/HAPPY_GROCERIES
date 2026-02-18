# Happy Groceries 🛒

A full-stack e-commerce grocery store built with React, Django, and PostgreSQL. Fully production-ready for Vercel deployment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🚀 Tech Stack

### Frontend
- React 18
- React Router DOM
- Context API for state management
- Axios for API calls
- CSS3 with custom properties & animations

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL (Neon)
- JWT Authentication (SimpleJWT)
- CORS support
- Whitenoise for static files
- dj-database-url for database configuration

## 📁 Project Structure

```
project/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, Cart, Theme)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── styles/        # CSS files
│   ├── public/
│   ├── .env               # Frontend environment variables
│   ├── package.json
│   └── vercel.json        # Vercel deployment config
│
├── backend/               # Django backend
│   ├── happy_groceries/   # Django project settings
│   ├── accounts/          # User authentication
│   ├── products/          # Products and categories
│   ├── cart/              # Shopping cart
│   ├── orders/            # Orders management
│   ├── coupons/           # Coupon system
│   ├── wishlist/          # Wishlist functionality
│   ├── .env               # Backend environment variables
│   ├── requirements.txt
│   ├── seed_data.py       # Database seeding script
│   └── vercel.json        # Vercel deployment config
│
├── .gitignore
└── README.md
```

## 🛠️ Environment Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

## 🚀 Deployment Guide

### Option 1: One-Click Deploy (Recommended)

1. **Fork/Clone this repository** to your GitHub account

2. **Deploy Backend to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Set **Root Directory** to `backend`
   - Add Environment Variables:
     ```
     SECRET_KEY=your-secure-random-secret-key-here
     DEBUG=False
     ```
   - Click Deploy

3. **Deploy Frontend to Vercel:**
   - Add another project in Vercel
   - Import the same repository
   - Set **Root Directory** to `frontend`
   - Set **Framework Preset** to "Create React App"
   - Add Environment Variables:
     ```
     REACT_APP_API_URL=https://your-backend-url.vercel.app/api
     ```
     (Replace with your actual backend URL from step 2)
   - Click Deploy

4. **Update CORS (if needed):**
   - In your backend Vercel project settings
   - Add your frontend URL to `CORS_ALLOWED_ORIGINS`
   - Or set `CORS_ALLOW_ALL_ORIGINS=True` for testing

5. **Seed the Database:**
   - Go to your backend Vercel deployment
   - The database is already configured with Neon PostgreSQL
   - Run seeding via Vercel CLI or locally:
     ```bash
     cd backend
     pip install -r requirements.txt
     python manage.py shell < seed_data.py
     ```

### Option 2: Manual Deployment

#### Backend Deployment

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment (optional for local testing):**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set environment variables:**
```bash
export SECRET_KEY=your-secret-key-here
export DEBUG=False
export CORS_ALLOW_ALL_ORIGINS=True
```

5. **Deploy to Vercel:**
```bash
vercel --prod
```

6. **Run migrations and seed data:**
```bash
vercel --prod -- python manage.py migrate
python manage.py shell < seed_data.py
```

#### Frontend Deployment

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set environment variables:**
Create `.env` file:
```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

4. **Deploy to Vercel:**
```bash
vercel --prod
```

## 🗄️ Database Setup

The database is already configured to use Neon PostgreSQL. To seed the database with products:

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python seed_data.py
```

This will create:
- 5 Categories (Fruits, Vegetables, Dairy, Snacks, Beverages)
- 74 Products with emojis, ratings, and descriptions
- 5 Coupons for discounts

## 🔧 Environment Variables

### Backend (.env)
```bash
# Required
SECRET_KEY=your-secure-random-secret-key-at-least-50-chars-long
DEBUG=False

# Optional (defaults are provided)
ALLOWED_HOSTS=*.vercel.app,localhost
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend.vercel.app/api
```

## 🧪 Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export SECRET_KEY=local-dev-key
export DEBUG=True

python manage.py migrate
python seed_data.py
python manage.py runserver
```
Backend runs at: http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs at: http://localhost:3000

## ✨ Features

- **User Authentication**: Phone-based JWT authentication
- **Product Catalog**: 74 products across 5 categories with emoji-based imagery
- **Shopping Cart**: Add/remove items, quantity controls, persistent storage
- **Order Management**: Complete order lifecycle with status tracking
- **Coupon System**: Multiple coupon types (percentage, fixed, category-specific)
- **Wishlist**: Save favorite products
- **Search & Filter**: Real-time product search and category filtering
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Full theme toggle with localStorage persistence
- **Animations**: CSS keyframe animations for delightful UX

## 🔒 Security Features

- JWT-based authentication
- CORS protection
- XSS protection
- SQL injection prevention
- Secure session cookies
- HSTS headers
- Content Security Policy

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/me/` - Get current user

### Products
- `GET /api/products/` - List all products
- `GET /api/products/:id/` - Get product details
- `GET /api/products/search/?q=query` - Search products
- `GET /api/products/categories/` - List categories

### Cart
- `GET /api/cart/` - Get cart
- `POST /api/cart/add/` - Add item to cart
- `PATCH /api/cart/items/:id/` - Update item quantity
- `DELETE /api/cart/items/:id/delete/` - Remove item

### Orders
- `GET /api/orders/` - List orders
- `POST /api/orders/create/` - Create order
- `GET /api/orders/:id/` - Get order details

### Coupons
- `GET /api/coupons/` - List coupons
- `POST /api/coupons/validate/` - Validate coupon

### Wishlist
- `GET /api/wishlist/` - Get wishlist
- `POST /api/wishlist/add/` - Add to wishlist
- `DELETE /api/wishlist/:product_id/` - Remove from wishlist

## 🐛 Troubleshooting

### CORS Issues
If you see CORS errors in the browser:
1. Check that `CORS_ALLOW_ALL_ORIGINS=True` in backend env
2. Or add your frontend URL to `CORS_ALLOWED_ORIGINS`

### Database Connection Issues
- Verify the Neon database URL is correct
- Check that SSL mode is set to `require`
- Ensure database credentials are valid

### Static Files Not Loading
- Whitenoise is configured for static files
- Run `python manage.py collectstatic` locally if needed

### Build Failures
- Ensure Node.js 18+ is used
- Clear cache: `vercel --force-with-cache`
- Check build logs in Vercel dashboard

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Credits

Built with ❤️ using React, Django, and PostgreSQL.
