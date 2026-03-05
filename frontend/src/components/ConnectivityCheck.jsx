import { useState, useEffect, useCallback } from 'react';
import ConnectivityError from '../pages/ConnectivityError';
import api from '../api/axios';

const ConnectivityCheck = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  const checkConnectivity = useCallback(async () => {
    setIsChecking(true);
    setHasFailed(false);

    try {
      const response = await api.get('/health/', { timeout: 8000 });
      const { status, database } = response.data;

      if (response.status === 200 && status === 'healthy' && database === 'connected') {
        setIsConnected(true);
        setHasFailed(false);
      } else {
        setIsConnected(false);
        setHasFailed(true);
      }
    } catch {
      setIsConnected(false);
      setHasFailed(true);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  const handleRetry = () => {
    checkConnectivity();
  };

  if (isChecking) {
    return (
      <div className="connectivity-checking connectivity-checking-screen">
        <div className="loading-spinner connectivity-checking-spinner" />
        <p className="connectivity-checking-text">Checking connection...</p>
      </div>
    );
  }

  if (hasFailed || !isConnected) {
    return <ConnectivityError onRetry={handleRetry} />;
  }

  return <>{children}</>;
};

export default ConnectivityCheck;
