import api from './axios';

export const getEducation = (params) => api.get('/education', { params });
export const createEducation = (data) => api.post('/education', data);
export const updateEducation = (id, data) => api.put(`/education/${id}`, data);
export const deleteEducation = (id) => api.delete(`/education/${id}`);
