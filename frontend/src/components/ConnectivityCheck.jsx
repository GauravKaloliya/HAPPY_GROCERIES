import { useState, useEffect, useCallback } from 'react';
import ConnectivityError from '../pages/ConnectivityError';
import ColdStart from '../pages/ColdStart';
import api from '../api/axios';

const ConnectivityCheck = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [isColdStart, setIsColdStart] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkConnectivity = useCallback(async () => {
    setIsChecking(true);
    setHasFailed(false);
    
    try {
      // First check - quick health check with short timeout
      const response = await api.get('/health/', { timeout: 8000 });
      const { status, database, cache } = response.data;
      
      // Verify both database and cache are connected
      if (response.status === 200 && 
          status === 'healthy' && 
          database === 'connected' && 
          cache === 'connected') {
        setIsConnected(true);
        setIsColdStart(false);
        setHasFailed(false);
        setRetryCount(0);
      } else if (database === 'disconnected' || cache === 'disconnected') {
        // Database or cache not ready - treat as cold start
        setIsColdStart(true);
        setIsConnected(false);
      } else {
        throw new Error('API not responding correctly');
      }
    } catch (error) {
      console.error('Connectivity check failed:', error);
      
      // Check if it's a 502, 503, or network error - likely cold start
      const statusCode = error.response?.status;
      const isNetworkError = !error.response && error.request;
      
      if (statusCode === 502 || statusCode === 503 || isNetworkError || statusCode === 504) {
        // Render cold start scenario
        setIsColdStart(true);
        setIsConnected(false);
        
        // Auto-retry after a delay if we haven't tried too many times
        if (retryCount < 15) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
        } else {
          // Too many retries, show error
          setIsColdStart(false);
          setHasFailed(true);
        }
      } else {
        setIsConnected(false);
        setHasFailed(true);
      }
    } finally {
      setIsChecking(false);
    }
  }, [retryCount]);

  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  // Effect to retry when retryCount changes (for cold start auto-retry)
  useEffect(() => {
    if (retryCount > 0 && retryCount < 15 && isColdStart && !isConnected) {
      const timer = setTimeout(() => {
        checkConnectivity();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [retryCount, isColdStart, isConnected, checkConnectivity]);

  const handleRetry = () => {
    setRetryCount(0);
    setIsColdStart(false);
    checkConnectivity();
  };

  if (isChecking && !isColdStart) {
    return (
      <div className="connectivity-checking" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-light)'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(0,0,0,0.1)',
          borderLeftColor: 'var(--primary-pink)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-dark)', fontWeight: 600 }}>
          Checking connection...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (isColdStart) {
    return <ColdStart progress={(retryCount / 15) * 100} />;
  }

  if (hasFailed || !isConnected) {
    return <ConnectivityError onRetry={handleRetry} />;
  }

  return <>{children}</>;
};

export default ConnectivityCheck;
