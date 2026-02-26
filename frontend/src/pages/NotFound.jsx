import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p className="not-found-message">
          Oops! The page you're looking for seems to have wandered off.
          It might have been moved, deleted, or never existed in first place.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-md btn-primary">
            🏠 Go Home
          </Link>
          <Link to="/shop" className="btn-md btn-success">
            🛒 Browse Shop
          </Link>
        </div>
        <div className="not-found-suggestions">
          <h3>You might be looking for:</h3>
          <ul>
            <li><Link to="/shop">Shop</Link> - Browse our products</li>
            <li><Link to="/categories">Categories</Link> - View all categories</li>
            <li><Link to="/offers">Offers</Link> - Check out current deals</li>
            <li><Link to="/about">About</Link> - Learn more about us</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
