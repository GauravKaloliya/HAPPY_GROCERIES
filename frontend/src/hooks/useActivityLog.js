import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { activityLogsAPI } from '../api/activityLogs';

const useActivityLog = (action, details = {}) => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const logActivity = async () => {
      try {
        await activityLogsAPI.logActivity({
          action,
          page: location.pathname,
          details,
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    };

    if (action) {
      logActivity();
    }
  }, [action, location.pathname, JSON.stringify(details)]);

  const logCustomActivity = async (customAction, customDetails = {}) => {
    try {
      await activityLogsAPI.logActivity({
        action: customAction,
        page: location.pathname,
        details: customDetails,
      });
    } catch (error) {
      console.error('Failed to log custom activity:', error);
    }
  };

  return { logCustomActivity };
};

export default useActivityLog;
