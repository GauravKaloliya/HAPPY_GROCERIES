import { useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { activityLogsAPI } from '../api/activityLogs';

const useActivityLog = (action, details = {}) => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate logging in StrictMode
    if (hasLoggedRef.current) return;
    
    const logActivity = async () => {
      try {
        await activityLogsAPI.logActivity({
          action,
          page: location.pathname,
          details,
        });
        hasLoggedRef.current = true;
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    };

    if (action) {
      logActivity();
    }
  }, [action, location.pathname, JSON.stringify(details)]);

  const logCustomActivity = useCallback(async (customAction, customDetails = {}) => {
    try {
      await activityLogsAPI.logActivity({
        action: customAction,
        page: location.pathname,
        details: customDetails,
      });
    } catch (error) {
      console.error('Failed to log custom activity:', error);
    }
  }, [location.pathname]);

  return { logCustomActivity };
};

export default useActivityLog;
