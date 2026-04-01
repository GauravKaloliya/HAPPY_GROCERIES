import api from './axios';
import { getClientSessionId } from '../utils/session';

export const activityLogsAPI = {
  logActivity: (data) => {
    const sessionId = getClientSessionId();
    return api.post('/activity-logs/log_activity/', {
      ...data,
      session_id: data?.session_id || sessionId,
    });
  },
  getLogs: (params) => api.get('/activity-logs/', { params }),
  getStatistics: () => api.get('/activity-logs/statistics/'),
};
