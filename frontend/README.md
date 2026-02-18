# Happy Groceries Frontend 🛒

A complete React + Vite + Tailwind CSS frontend for the Happy Groceries e-commerce application.

## Features

- **Authentication System**: JWT-based auth with register, login, logout, profile management
- **Product Catalog**: 74 products across 5 categories (Fruits, Vegetables, Dairy, Snacks, Beverages)
- **Search & Filter**: Real-time search with debounce, category filtering, sorting
- **Shopping Cart**: Add/remove items, quantity controls, tax & delivery calculations
- **Coupon System**: 5 coupons (SAVE20, FRESH15, WELCOME50, DAIRY10, SNACKS25)
- **Wishlist**: Save favorite products
- **Checkout Flow**: Multi-step checkout with delivery info and payment
- **Order History**: View past orders with status tracking
- **Dark Mode**: Full dark theme support with persistence
- **Responsive Design**: Mobile-first, works on all devices

## Tech Stack

- React 19 + Vite
- Tailwind CSS 4
- Redux Toolkit (state management)
- React Router v7
- Axios (API calls with JWT interceptors)
- React Hot Toast (notifications)
- Lucide React (icons)

## Project Structure

```
src/
├── api/           # API service files
│   ├── axios.js   # Axios instance with JWT interceptors
│   ├── auth.js    # Auth API endpoints
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   └── coupons.js
├── components/    # Reusable components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   ├── CategoryCard.jsx
│   ├── CartItem.jsx
│   ├── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── pages/         # Page components
│   ├── Home.jsx
│   ├── Shop.jsx
│   ├── Categories.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Wishlist.jsx
│   ├── Orders.jsx
│   ├── Profile.jsx
│   ├── About.jsx
│   ├── Login.jsx
│   └── Signup.jsx
├── store/         # Redux store
│   ├── index.js
│   └── slices/
│       ├── authSlice.js
│       ├── cartSlice.js
│       └── themeSlice.js
├── utils/         # Utilities
│   ├── constants.js
│   └── helpers.js
├── App.jsx
├── main.jsx
└── index.css
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

Base URL: `https://happygroceriesapi.onrender.com`

The app uses JWT authentication with automatic token refresh.

## Design System

- **Colors**: Pastel pink (#FFB6C1), green (#90EE90), blue (#87CEEB), yellow (#FFE4B5), peach (#FFDAB9)
- **Fonts**: Poppins, Nunito, Comic Neue
- **Icons**: Emoji icons for products, Lucide icons for UI
- **Animations**: Bounce, float, glow, shimmer effects
