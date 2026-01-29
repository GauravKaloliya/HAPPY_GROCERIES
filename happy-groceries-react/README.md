# Happy Groceries React 🛒

A modern React.js single-page application (SPA) conversion of the Happy Groceries vanilla JavaScript e-commerce website. Fresh groceries delivered to your door with a smooth, responsive user experience.

## 🚀 Features

### Core E-commerce Features
- **🛍️ Product Catalog**: Browse 74+ fresh products across 5 categories
- **🔍 Smart Search**: Real-time search with filters and sorting
- **🛒 Shopping Cart**: Add/remove items, update quantities, cart persistence
- **🎫 Coupon System**: Smart coupon recommendations with eligibility checking
- **💝 Wishlist**: Save favorite products (per-user)
- **📦 Order Management**: Complete order history and tracking
- **🏠 Address Management**: Save and manage delivery addresses

### Authentication & User Management
- **📱 Phone-based Authentication**: Simple and secure phone number signup/login
- **🔐 Session Management**: Secure sessions with automatic timeouts
- **👤 User Profiles**: Edit profile information and preferences
- **🛡️ Security Features**: SHA-256 password hashing, input sanitization, CSRF protection

### User Experience
- **🌙 Dark/Light Theme**: Toggle between themes with localStorage persistence
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **🔔 Toast Notifications**: Real-time feedback for user actions
- **⚡ Fast Navigation**: Single Page Application with React Router
- **🎨 Smooth Animations**: CSS animations and transitions

### Technical Features
- **🔒 Secure Storage**: Encrypted localStorage for sensitive data
- **🚚 Delivery System**: Standard and express delivery options
- **💰 Price Calculations**: Tax, delivery charges, and discount calculations
- **⏱️ Real-time Updates**: Live cart updates and inventory management

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx       # Main navigation
│   ├── Footer.jsx       # Site footer
│   └── ProductCard.jsx  # Product display component
├── pages/              # Page components
│   ├── Home.jsx         # Landing page
│   ├── Login.jsx        # User login
│   ├── Signup.jsx       # User registration
│   ├── Products.jsx     # Product listing
│   ├── ProductDetails.jsx # Individual product page
│   ├── Cart.jsx         # Shopping cart
│   ├── Checkout.jsx     # Order checkout
│   ├── Profile.jsx      # User profile
│   ├── Wishlist.jsx     # User wishlist
│   ├── Orders.jsx       # Order history
│   ├── Offers.jsx       # Coupon offers
│   └── NotFound.jsx     # 404 error page
├── context/            # React Context providers
│   ├── AuthContext.jsx  # Authentication state
│   └── CartContext.jsx # Shopping cart state
├── services/           # Business logic layer
│   ├── authService.js  # Authentication logic
│   ├── cartService.js  # Cart and coupon logic
│   └── productService.js # Product data and search
├── utils/              # Utility functions
│   ├── security.js     # Security utilities
│   └── config.js       # App configuration
└── styles/             # CSS stylesheets
    └── index.css        # Global styles and animations
```

### State Management
- **React Context API**: Global state management for authentication and cart
- **useReducer**: Complex state updates with immutable patterns
- **localStorage**: Persistent storage for user data and cart
- **Custom Hooks**: Reusable logic across components

### Security Implementation
- **Password Hashing**: SHA-256 with salt using crypto-js
- **Data Encryption**: AES encryption for localStorage
- **Input Validation**: Client-side validation with sanitization
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Tokens**: Protection against cross-site request forgery
- **Rate Limiting**: Prevent brute force attacks
- **Session Management**: Automatic session timeout and renewal

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router 6
- **Build Tool**: Vite (fast development and building)
- **Styling**: Vanilla CSS with CSS custom properties
- **Security**: crypto-js for encryption and hashing
- **Notifications**: react-toastify
- **Icons**: Unicode emojis for lightweight icons
- **Fonts**: Google Fonts (Nunito, Poppins)

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd happy-groceries-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

The build files will be generated in the `dist/` directory.

## 🎯 Usage

### For Users

1. **Sign Up**: Create an account with your phone number
2. **Browse Products**: Explore our fresh product catalog
3. **Add to Cart**: Select quantities and add items to your cart
4. **Apply Coupons**: Use smart coupon recommendations
5. **Checkout**: Complete your order with delivery details
6. **Track Orders**: View order history and status

### For Developers

The application is built with modern React patterns:

- **Functional Components**: All components use hooks
- **Context API**: Global state management
- **Service Layer**: Separated business logic
- **Custom Hooks**: Reusable component logic
- **CSS Modules**: Scoped styling approach

## 🔧 Configuration

### Environment Variables
Create a `.env` file for custom configuration:

```env
VITE_APP_NAME=Happy Groceries
VITE_API_BASE_URL=http://localhost:3000
VITE_SESSION_TIMEOUT=1800000
```

### Customization

- **Themes**: Modify CSS custom properties in `src/styles/index.css`
- **Products**: Update product data in `src/services/productService.js`
- **Coupons**: Configure coupons in `src/services/cartService.js`
- **Security**: Adjust settings in `src/utils/config.js`

## 🧪 Testing

### Demo Credentials
For testing purposes, you can use these demo credentials:
- **Phone**: 1234567890
- **Password**: password123

Or create a new account with any valid phone number.

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔒 Security Notes

This is a demo application with client-side security measures. For production use:

- Implement server-side authentication
- Use HTTPS for all communications
- Add proper backend API security
- Implement proper database security
- Add comprehensive input validation on the server

## 🚀 Performance

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Responsive image loading
- **Minimal Bundle**: Vite's optimized build process
- **Caching**: localStorage for offline capability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Original Happy Groceries vanilla JavaScript version
- React.js team for the amazing framework
- Vite for the fast build tool
- All contributors and testers

---

**Happy Shopping! 🛒✨**

Built with ❤️ using React.js