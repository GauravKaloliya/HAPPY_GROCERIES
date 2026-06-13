# Happy Groceries 🛒

> Happy Groceries is a full-stack grocery shopping platform built with a Django REST backend and a React + Vite frontend. It supports browsing products, managing cart and wishlist items, placing orders, using coupons, writing reviews, and handling admin operations from a dedicated dashboard.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python, Django, Django REST Framework, SimpleJWT, django-filter |
| **Frontend** | React 19, Vite, React Router, Redux Toolkit, Axios |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL |
| **Cache / Tokens** | Redis |
| **Deployment** | Gunicorn, WhiteNoise, Render |

---

## ✨ Key Features

- 🛍 Product browsing with categories and product details
- 🔎 Search, sorting, and filter-ready catalog endpoints
- 🛒 Cart management and checkout flow
- 💖 Wishlist support
- 🧾 Coupon handling and usage tracking
- ⭐ Product reviews and helpful votes
- 👤 User registration, login, logout, and profile management
- 🔐 JWT authentication with refresh token rotation
- 🛠 Admin login, dashboard, and product management
- 🩺 Health and status endpoints for monitoring

---

## 📁 Project Structure

```text
HAPPY_GROCERIES-main/
├── backend/
│   ├── config/
│   ├── users/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── coupons/
│   ├── wishlist/
│   ├── reviews/
│   ├── contact/
│   ├── site_config/
│   ├── activity_logs/
│   ├── schema.sql
│   └── seed_data.sql
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
├── render.yaml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis

### Backend Setup

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/happy_groceries
REDIS_URL=redis://localhost:6379/0
ENVIRONMENT=development
```

Optional local values:

```env
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

Install backend dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Create an admin user if needed:

```bash
python manage.py createsuperuser
```

Start the backend:

```bash
python manage.py runserver 127.0.0.1:8000
```

### Frontend Setup

Install frontend dependencies:

```bash
cd frontend
npm install
```

Run the frontend:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

---

## 🤖 App Flow

1. The frontend loads configuration and theme state on startup
2. Users browse products, categories, offers, and product details
3. Authenticated users can manage cart, wishlist, checkout, orders, profile, and reviews
4. The app refreshes JWT access tokens automatically when needed
5. The backend serves health and status endpoints for monitoring and deployment checks

---

## 📦 API Surface

| Route Group | Purpose |
|---|---|
| `auth/` | Register, login, logout, token refresh, profile, password change |
| `products/` | Products and categories |
| `cart/` | Cart operations |
| `orders/` | Checkout and order history |
| `coupons/` | Coupon validation and usage |
| `wishlist/` | Wishlist management |
| `reviews/` | Product reviews |
| `contact/` | Contact form submissions |
| `config/` | Runtime site settings and sort options |
| `activity-logs/` | Activity logging |

Operational endpoints:

- `GET /health/`
- `GET /status/`
- `GET /django-admin/`

In development, the API is also available under `/api/` because Django prefixes the routes when `DEBUG=True`.

---

## 🧪 Supporting Files

- `backend/schema.sql` contains the database schema
- `backend/seed_data.sql` contains sample data
- `backend/Procfile` defines the Gunicorn start command
- `render.yaml` contains Render deployment settings
- `frontend/src/store/` contains Redux slices and state logic
- `frontend/src/api/` contains the Axios API wrappers

---

## 📝 Notes

- `backend/manage.py` automatically loads `backend/.env` if it exists.
- The backend requires `DATABASE_URL` and `REDIS_URL`.
- `frontend/src/api/axios.js` auto-detects the API URL unless `VITE_API_BASE_URL` is set.
- If you build the frontend, Django can serve the SPA bundle from `frontend/dist`.

