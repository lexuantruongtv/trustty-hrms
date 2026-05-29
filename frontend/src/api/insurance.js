import api from './axios';

export const getInsurance = (params) => api.get('/insurance', { params });
export const createInsurance = (data) => api.post('/insurance', data);
export const updateInsurance = (id, data) => api.put(`/insurance/${id}`, data);
export const deleteInsurance = (id) => api.delete(`/insurance/${id}`);
