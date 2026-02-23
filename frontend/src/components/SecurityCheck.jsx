import { useState, useEffect, createContext, useContext } from 'react';
import api from '../api/axios';

const SecurityContext = createContext({
  isSecure: true,
  isLoading: true,
  error: null,
  retryCheck: () => {},
});

export const useSecurity = () => useContext(SecurityContext); // eslint-disable-line react-refresh/only-export-components

export const SecurityCheck = ({ children }) => {
  const [isSecure, setIsSecure] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkConnectivity = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check API status first
      const apiResponse = await api.get('/status/');

      if (apiResponse.data.status !== 'operational') {
        throw new Error('API is not operational');
      }

      // Check database and cache connectivity
      const healthResponse = await api.get('/health/');

      if (healthResponse.data.status !== 'healthy') {
        const issues = [];
        if (healthResponse.data.database !== 'connected') {
          issues.push('Database');
        }
        if (healthResponse.data.cache !== 'connected') {
          issues.push('Cache');
        }
        throw new Error(`${issues.join(' and ')} connectivity issue detected`);
      }

      setIsSecure(true);
      setError(null);
    } catch (err) {
      console.error('Security check failed:', err);
      setIsSecure(false);
      setError(err.message || 'Connection error detected');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnectivity();

    // Re-check connectivity every 5 minutes
    const interval = setInterval(() => {
      checkConnectivity();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [retryCount]);

  const retryCheck = () => {
    setRetryCount(prev => prev + 1);
  };

  const value = {
    isSecure,
    isLoading,
    error,
    retryCheck,
  };

  if (isLoading) {
    return (
      <div className="security-loading">
        <div className="loading-spinner"></div>
        <p>Checking system connectivity...</p>
      </div>
    );
  }

  if (!isSecure) {
    return (
      <SecurityError
        error={error}
        onRetry={retryCheck}
      />
    );
  }

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

const SecurityError = ({ error, onRetry }) => {
  return (
    <div className="security-error-page">
      <div className="security-error-content">
        <div className="security-error-icon">⚠️</div>
        <h1>Something Went Wrong</h1>
        <h2>Connectivity Issue Detected</h2>
        <p className="error-message">
          {error || 'We are unable to connect to our servers. This could be due to:'}
        </p>
        <ul className="error-causes">
          <li>🌐 Network connection issues</li>
          <li>🔧 Server maintenance in progress</li>
          <li>🗄️ Database connectivity problems</li>
          <li>⏳ Temporary service disruption</li>
        </ul>
        <div className="error-actions">
          <button onClick={onRetry} className="btn-retry">
            🔄 Retry Connection
          </button>
          <button onClick={() => window.location.reload()} className="btn-refresh">
            🔃 Refresh Page
          </button>
        </div>
        <p className="error-help">
          If problem persists, please contact our support team or try again later.
        </p>
      </div>
    </div>
  );
};

export default SecurityCheck;
