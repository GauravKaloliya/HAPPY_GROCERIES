import api from './axios';

export const activityLogsAPI = {
  logActivity: (data) => api.post('/activity-logs/log_activity/', data),
  getLogs: (params) => api.get('/activity-logs/', { params }),
  getStatistics: () => api.get('/activity-logs/statistics/'),
};
