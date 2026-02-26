import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { initializeTheme } from './store/slices/themeSlice';
import { fetchConfig } from './store/slices/configSlice';
import { fetchCart } from './store/slices/cartSlice';
import { selectIsAuthenticated } from './store/slices/authSlice';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectivityCheck from './components/ConnectivityCheck';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Categories from './pages/Categories';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MyReviews from './pages/MyReviews';
import Offers from './pages/Offers';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

// Initialize theme and config
store.dispatch(initializeTheme());
store.dispatch(fetchConfig());

const MainLayout = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Set internal navigation flag when route changes via internal navigation
    if (location.state?.fromInternal) {
      sessionStorage.setItem('internalNavigation', 'true');
    }
  }, [location]);
  
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

// Wrapper component to check navigation source
const NavigationGuard = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    // Mark as internal navigation on first mount
    sessionStorage.setItem('internalNavigation', 'true');
  }, []);
  
  // Check if this is a direct URL access (not from internal navigation)
  const navEntry = performance.getEntriesByType('navigation')[0];
  const hasNavigated = sessionStorage.getItem('internalNavigation');
  
  // Allow home page always
  if (location.pathname === '/') {
    return children;
  }
  
  // Allow auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return children;
  }
  
  // Check for direct navigation (reload or direct URL entry)
  if (navEntry && (navEntry.type === 'reload' || navEntry.type === 'navigate')) {
    // If we don't have internal navigation flag, it might be direct access
    // But we need to be careful - allow if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    if (!hasNavigated && !accessToken && navEntry.type === 'navigate') {
      // Check referrer - if empty or external, redirect to home
      if (!document.referrer || !document.referrer.includes(window.location.origin)) {
        return <Navigate to="/" replace />;
      }
    }
  }
  
  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <ConnectivityCheck>
        <Routes>
          {/* Routes with Header + Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<NavigationGuard><Shop /></NavigationGuard>} />
            <Route path="/product/:id" element={<NavigationGuard><ProductDetails /></NavigationGuard>} />
            <Route path="/categories" element={<NavigationGuard><Categories /></NavigationGuard>} />
            <Route path="/offers" element={<NavigationGuard><Offers /></NavigationGuard>} />
            <Route path="/about" element={<NavigationGuard><About /></NavigationGuard>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cart" element={<NavigationGuard><Cart /></NavigationGuard>} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <NavigationGuard><Checkout /></NavigationGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <NavigationGuard><Wishlist /></NavigationGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <NavigationGuard><Orders /></NavigationGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <NavigationGuard><Profile /></NavigationGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <NavigationGuard><Settings /></NavigationGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <ProtectedRoute>
                  <NavigationGuard><MyReviews /></NavigationGuard>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 - No header/footer */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--primary-green)',
              color: 'var(--text-dark)',
              borderRadius: '15px',
              padding: '16px 24px',
              boxShadow: 'var(--shadow-hover)',
              fontWeight: 600,
            },
            success: {
              style: {
                background: 'var(--primary-green)',
              },
            },
            error: {
              style: {
                background: '#ff4444',
                color: 'white',
              },
            },
          }}
        />
      </ConnectivityCheck>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
