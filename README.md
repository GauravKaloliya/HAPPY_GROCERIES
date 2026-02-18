# Happy Groceries 🛒

A full-stack e-commerce grocery store built with React, Django, and PostgreSQL.

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Context API for state management
- CSS3 with custom properties

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL (Neon)
- JWT Authentication
- CORS support

## Project Structure

```
project/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts (Auth, Cart, Theme)
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── styles/       # CSS files
│   ├── public/
│   └── package.json
│
└── backend/           # Django backend
    ├── happy_groceries/  # Django project settings
    ├── accounts/         # User authentication
    ├── products/         # Products and categories
    ├── cart/             # Shopping cart
    ├── orders/           # Orders management
    ├── coupons/          # Coupon system
    ├── wishlist/         # Wishlist functionality
    ├── requirements.txt
    └── vercel.json
```

## Environment Variables

### Frontend
Create `.env` file in `/frontend`:
```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

### Backend
Create `.env` file in `/backend`:
```
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-backend-url.vercel.app,localhost

# Database
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=your-db-password
DB_HOST=your-db-host.neon.tech
DB_PORT=5432
DB_SSLMODE=require

# CORS
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000
```

## Deployment to Vercel

### Backend Deployment

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Deploy to Vercel:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from the Backend section above

5. Run migrations:
   - In Vercel dashboard, go to Functions and run the migration command
   - Or use `vercel --prod` to deploy and then manually trigger migrations

### Frontend Deployment

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update the API URL in environment variables

4. Deploy to Vercel:
```bash
vercel
```

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Features

- User authentication (JWT-based)
- Product catalog with categories
- Shopping cart with coupon support
- Order management
- Wishlist functionality
- Responsive design
- Dark mode support

## License

MIT
