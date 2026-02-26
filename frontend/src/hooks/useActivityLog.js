import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { activityLogsAPI } from '../api/activityLogs';

const useActivityLog = (action, details = {}) => {
  const location = useLocation();
  const hasLoggedRef = useRef(false);
  const memoizedDetails = useMemo(() => details, [details]);

  useEffect(() => {
    // Prevent duplicate logging in StrictMode
    if (hasLoggedRef.current) return;
    
    const logActivity = async () => {
      try {
        await activityLogsAPI.logActivity({
          action,
          page: location.pathname,
          details: memoizedDetails,
        });
        hasLoggedRef.current = true;
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    };

    if (action) {
      logActivity();
    }
  }, [action, location.pathname, memoizedDetails]);

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
