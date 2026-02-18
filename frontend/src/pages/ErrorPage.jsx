import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="error-page-container">
      <div className="error-page-content">
        <div className="error-page-icon">
          {isOnline ? '⚠️' : '📡'}
        </div>
        
        {!isOnline ? (
          <>
            <h1 className="error-page-code">No Internet</h1>
            <h2 className="error-page-title">You're Offline</h2>
            <p className="error-page-message">
              Please check your internet connection and try again.
            </p>
          </>
        ) : (
          <>
            <h1 className="error-page-code">500</h1>
            <h2 className="error-page-title">Something Went Wrong</h2>
            <p className="error-page-message">
              We're sorry, but something went wrong on our end. 
              Our team has been notified and is working to fix it.
            </p>
          </>
        )}

        <div className="error-page-actions">
          <button 
            onClick={handleRetry} 
            className="btn-primary"
            disabled={retrying}
          >
            {retrying ? '⟳ Retrying...' : '🔄 Try Again'}
          </button>
          <Link to="/" className="btn-secondary">
            🏠 Go Home
          </Link>
        </div>

        <div className="connection-status">
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {isOnline ? 'Connected to Server' : 'Disconnected'}
            </span>
          </div>
          
          {isOnline && (
            <div className="status-info">
              <p>Database Status: <span className="status-checking">Checking...</span></p>
              <p>API Status: <span className="status-checking">Checking...</span></p>
            </div>
          )}
        </div>

        <div className="error-page-help">
          <h3>Need Help?</h3>
          <p>Contact our support team:</p>
          <ul>
            <li>📧 Email: support@happygroceries.com</li>
            <li>📞 Phone: +91 98765 43210</li>
            <li>💬 Live Chat: Available 24/7</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
