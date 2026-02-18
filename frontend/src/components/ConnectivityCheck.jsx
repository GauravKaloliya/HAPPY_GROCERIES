import { useState, useEffect } from 'react';
import ConnectivityError from '../pages/ConnectivityError';
import api from '../api/axios';

const ConnectivityCheck = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  const checkConnectivity = async () => {
    setIsChecking(true);
    try {
      const response = await api.get('/health/', { timeout: 5000 });
      const statusValue = response.data?.status;
      if (response.status === 200 && (!statusValue || ['healthy', 'operational', 'ok'].includes(statusValue))) {
        setIsConnected(true);
        setHasFailed(false);
      } else {
        throw new Error('API not responding correctly');
      }
    } catch (error) {
      console.error('Connectivity check failed:', error);
      setIsConnected(false);
      setHasFailed(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  const handleRetry = () => {
    checkConnectivity();
  };

  if (isChecking) {
    return (
      <div className="connectivity-checking">
        <div className="loading-spinner"></div>
        <p>Checking connection...</p>
      </div>
    );
  }

  if (hasFailed || !isConnected) {
    return <ConnectivityError onRetry={handleRetry} />;
  }

  return <>{children}</>;
};

export default ConnectivityCheck;
