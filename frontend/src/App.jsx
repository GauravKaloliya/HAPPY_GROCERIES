import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { store } from './store';
import { initializeTheme } from './store/slices/themeSlice';
import { fetchConfig } from './store/slices/configSlice';
import { fetchCart } from './store/slices/cartSlice';
import { selectIsAuthenticated } from './store/slices/authSlice';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import MobileTabBar from './components/MobileTabBar';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectivityCheck from './components/ConnectivityCheck';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

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
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductForm from './pages/AdminProductForm';

// Initialize theme and config
store.dispatch(initializeTheme());
store.dispatch(fetchConfig());

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main app-shell-main">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
};

const AppContent = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <ConnectivityCheck>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products/new" element={<AdminProductForm />} />
              <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
            </Route>
          </Route>

          {/* Routes with Header + Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <ProtectedRoute>
                  <MyReviews />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 - No header/footer */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster
          position="bottom-center"
          gutter={12}
          containerStyle={{
            bottom: '16px',
            left: '16px',
            right: '16px',
          }}
          toastOptions={{
            duration: 3000,
            className: 'app-toast',
            style: {
              background: 'var(--primary-green)',
              color: 'var(--text-dark)',
              borderRadius: '14px',
              padding: '12px 14px',
              boxShadow: 'var(--shadow-hover)',
              fontWeight: 600,
              width: 'min(90vw, 420px)',
              maxWidth: '90vw',
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
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ message }) => (
                <div className="app-toast-inner">
                  <span>{message}</span>
                  <button
                    type="button"
                    className="app-toast-close"
                    onClick={() => toast.dismiss(t.id)}
                    aria-label="Close toast"
                  >
                    ✕
                  </button>
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>
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
