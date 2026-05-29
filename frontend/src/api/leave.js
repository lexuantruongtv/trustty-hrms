import api from './axios';

export const getLeaves = (params) => api.get('/leave', { params });
export const createLeave = (data) => api.post('/leave', data);
export const approveLeave = (id) => api.put(`/leave/${id}/approve`);
export const rejectLeave = (id) => api.put(`/leave/${id}/reject`);
export const deleteLeave = (id) => api.delete(`/leave/${id}`);
