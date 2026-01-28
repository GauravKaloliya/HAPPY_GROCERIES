# Happy Groceries 🛒

A complete, fully-functional cute animated grocery store website with user authentication, shopping cart, wishlist, and dynamic features.

## Features

### 🔐 Authentication System
- **Sign Up**: Register with phone number, name, email (optional), and password
- **Login**: Login using phone number and password
- **Session Management**: Persistent sessions across page reloads
- **Password Validation**: Real-time password strength indicator
- **Form Validation**: Comprehensive client-side validation

### 🧭 Dynamic Navigation Bar
- **Responsive Design**: Hamburger menu on mobile devices
- **Authentication-Based**: Different UI for logged-in and logged-out users
- **User Profile Dropdown**: Quick access to profile, orders, wishlist, and settings
- **Cart Counter**: Real-time cart item count
- **Dark/Light Mode Toggle**: Theme switcher with persistence

### 🛍️ Shopping Features
- **Product Catalog**: 24 products across 5 categories
- **Search**: Real-time search with debouncing
- **Filter by Category**: Fruits, Vegetables, Dairy, Snacks, Beverages
- **Sort Options**: By price, name, or rating
- **Shopping Cart**: Add/remove items, update quantities
- **Wishlist**: Save favorite products (requires login)
- **Checkout**: Complete order flow with delivery information

### 🎨 UI/UX Features
- **Cute Animations**: Floating icons, bounce effects, glow animations
- **Dark Mode**: Full dark mode support with smooth transitions
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Toast Notifications**: User feedback for actions
- **Modal Dialogs**: Success confirmations
- **Empty States**: Helpful messages when cart/wishlist is empty

### 💾 Data Persistence
- **localStorage**: All data persists across sessions
- **User Data**: Account information, orders, wishlist
- **Cart Data**: Shopping cart items and quantities
- **Theme Preference**: Dark/light mode selection
- **Session Data**: Login state

## Project Structure

```
WAD_PROJECT/
├── index.html              # Home page
├── css/
│   └── styles.css          # All styles and animations
├── js/
│   ├── auth.js             # Authentication logic
│   ├── cart.js             # Shopping cart functions
│   ├── search.js           # Search, filter, sort logic & product data
│   └── main.js             # DOM manipulation, UI logic
├── pages/
│   ├── login.html          # Login page
│   ├── signup.html         # Sign up page
│   ├── shop.html           # All products page
│   ├── categories.html     # Categories browser
│   ├── cart.html           # Shopping cart
│   ├── checkout.html       # Checkout page
│   ├── wishlist.html       # User wishlist
│   └── about.html          # About us & contact
└── assets/
    └── images/             # Image assets directory

```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, animations, flexbox, grid
- **Vanilla JavaScript**: No frameworks or libraries
- **localStorage**: Client-side data persistence
- **Google Fonts**: Poppins, Nunito, Comic Neue

## Getting Started

1. Clone the repository
2. Open `index.html` in a web browser
3. No build process or dependencies required!

## How to Use

### For Users
1. **Browse Products**: Visit the shop page to see all products
2. **Sign Up**: Create an account using your phone number
3. **Login**: Access your account with phone and password
4. **Add to Cart**: Select quantity and add items to cart
5. **Wishlist**: Save favorite items (requires login)
6. **Checkout**: Complete your order with delivery details
7. **Dark Mode**: Toggle theme using the moon/sun icon

### For Developers
- All JavaScript is in separate modules for easy maintenance
- CSS uses custom properties for theming
- Product data is in `js/search.js` - easily extendable
- Authentication uses simple password hashing (upgrade for production)
- All animations are CSS-based for 60fps performance

## Key Functions

### Authentication (auth.js)
- `registerUser(name, phone, email, password)` - Register new user
- `loginUser(phone, password)` - Login existing user
- `logoutUser()` - Logout and redirect
- `getCurrentUser()` - Get logged-in user
- `isUserLoggedIn()` - Check authentication status

### Cart (cart.js)
- `addToCart(product, quantity)` - Add item to cart
- `removeFromCart(productId)` - Remove item
- `updateQuantity(productId, quantity)` - Update item quantity
- `calculateTotal()` - Get total with tax
- `clearCart()` - Empty cart

### Search (search.js)
- `searchProducts(query)` - Search by name/category
- `getProductsByCategory(category)` - Filter by category
- `sortProducts(products, sortBy)` - Sort products
- `filterAndSearchProducts(query, category, sortBy)` - Combined filtering

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - See LICENSE file for details

## Author

Gaurav Kaloliya

---

Made with 💖 for WAD Project
