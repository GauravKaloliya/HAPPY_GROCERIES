import api from './axios';

export const activityLogsAPI = {
  logActivity: (data) => api.post('/api/activity-logs/log_activity/', data),
  getLogs: (params) => api.get('/api/activity-logs/', { params }),
  getStatistics: () => api.get('/api/activity-logs/statistics/'),
};
