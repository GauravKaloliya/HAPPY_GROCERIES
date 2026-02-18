import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="error-page-container">
      <div className="error-page-content">
        <div className="error-page-icon">🔍</div>
        <h1 className="error-page-code">404</h1>
        <h2 className="error-page-title">Page Not Found</h2>
        <p className="error-page-message">
          Oops! The page you're looking for doesn't exist. 
          It might have been moved or deleted.
        </p>
        <div className="error-page-actions">
          <Link to="/" className="btn-primary">
            🏠 Go Home
          </Link>
          <Link to="/shop" className="btn-secondary">
            🛒 Continue Shopping
          </Link>
        </div>
        
        <div className="error-page-suggestions">
          <h3>You might be looking for:</h3>
          <ul>
            <li><Link to="/categories">Browse Categories</Link></li>
            <li><Link to="/offers">Check Out Our Offers</Link></li>
            <li><Link to="/about">Learn About Us</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
