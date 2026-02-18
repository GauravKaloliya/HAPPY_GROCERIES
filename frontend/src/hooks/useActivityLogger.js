import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import activityLogger from '../utils/activityLogger';

export const useActivityLogger = () => {
  const location = useLocation();

  useEffect(() => {
    // Log page view on route change
    activityLogger.logPageView();
  }, [location.pathname]);

  return activityLogger;
};

export default useActivityLogger;
