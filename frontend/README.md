# Happy Groceries Frontend 🛒

React application for the Happy Groceries e-commerce store.

## 🚀 Features

- **React 18** - Latest React with hooks
- **React Router v6** - Client-side routing
- **Context API** - State management (Auth, Cart, Theme)
- **JWT Authentication** - Secure token-based auth
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Full theme toggle
- **CSS Animations** - Smooth transitions and effects

## 📋 Requirements

- Node.js 18+
- npm or yarn

## 🛠️ Setup

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env
```

3. **Update `.env` with your backend URL:**
```
REACT_APP_API_URL=http://localhost:8000/api
```

4. **Start development server:**
```bash
npm start
```

App runs at: http://localhost:3000

### Production Build

```bash
npm run build
```

Build output is in the `build/` directory.

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
     - `REACT_APP_API_URL` = `https://your-backend-url.vercel.app/api`

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.js      # Page layout wrapper
│   │   ├── Navbar.js      # Navigation bar
│   │   └── Footer.js      # Footer
│   ├── UI/
│   │   ├── ProductCard.js # Product display card
│   │   └── Toast.js       # Toast notifications
│   └── ProtectedRoute.js  # Auth route guard
├── contexts/
│   ├── AuthContext.js     # Authentication state
│   ├── CartContext.js     # Shopping cart state
│   └── ThemeContext.js    # Dark/light theme
├── pages/
│   ├── Home.js            # Home page
│   ├── Shop.js            # Product listing
│   ├── ProductDetails.js  # Single product
│   ├── Cart.js            # Shopping cart
│   ├── Checkout.js        # Checkout flow
│   ├── Login.js           # Login page
│   ├── Register.js        # Registration
│   ├── Profile.js         # User profile
│   ├── Orders.js          # Order history
│   ├── Wishlist.js        # User wishlist
│   ├── Offers.js          # Coupons & offers
│   ├── Categories.js      # Category listing
│   └── About.js           # About page
├── services/
│   └── api.js             # API service layer
├── styles/
│   ├── variables.css      # CSS variables
│   ├── index.css          # Global styles
│   └── pages.css          # Page-specific styles
├── App.js                 # Main app component
└── index.js               # Entry point
```

## 🎨 Features

### Pages
- **Home** - Featured products, hero section
- **Shop** - Product grid with search & filters
- **Product Details** - Full product info, add to cart
- **Cart** - Manage cart items, apply coupons
- **Checkout** - Delivery info, order summary
- **Orders** - Order history with status
- **Wishlist** - Saved products
- **Offers** - Available coupons and deals

### Contexts
- **AuthContext** - Login/logout, user data, JWT tokens
- **CartContext** - Add/remove items, quantities, totals
- **ThemeContext** - Dark/light mode toggle

### API Integration
All API calls are centralized in `services/api.js` using Axios with:
- Automatic token injection
- Token refresh on 401 errors
- Request/response interceptors

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `https://api.example.com/api` |

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Create production build |
| `npm test` | Run tests |
| `npm run serve` | Serve production build locally |

## 🌐 Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers

## 📝 License

MIT License
