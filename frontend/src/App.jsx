import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { initializeTheme } from './store/slices/themeSlice';
import { fetchConfig } from './store/slices/configSlice';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
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
import Offers from './pages/Offers';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

// Initialize theme and config
store.dispatch(initializeTheme());
store.dispatch(fetchConfig());

const MainLayout = () => (
  <div className="app-layout">
    <Header />
    <main className="app-main">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <ConnectivityCheck>
          <Routes>
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
    </Provider>
  );
}

export default App;
