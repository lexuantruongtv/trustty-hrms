import api from './axios';
export const getNotifications = () => api.get('/notifications');
export const markAllRead = () => api.put('/notifications/read-all');
