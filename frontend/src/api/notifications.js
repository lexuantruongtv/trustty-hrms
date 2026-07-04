import api from './axios';
export const getNotifications = () => api.get('/notifications');
export const markAllRead = () => api.put('/notifications/read-all');
export const sendNotification = (data) => api.post('/notifications', data);
export const getAdminNotifications = () => api.get('/notifications/admin');
export const getDetailNotification = (params) => api.get('/notifications/admin/detail', { params });
export const updateNotificationGroup = (data) => api.put('/notifications/admin', data);
export const deleteNotificationGroup = (data) => api.delete('/notifications/admin', { data });
