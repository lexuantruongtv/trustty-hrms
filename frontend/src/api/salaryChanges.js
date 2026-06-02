import api from './axios';

export const getSalaryChanges = (params) => api.get('/salary-changes', { params });
export const createSalaryChange = (data) => api.post('/salary-changes', data);
export const deleteSalaryChange = (id) => api.delete(`/salary-changes/${id}`);
