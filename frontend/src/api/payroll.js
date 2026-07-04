import api from './axios';

export const getPayroll = (params) => api.get('/payroll', { params });
export const calculatePayroll = (data) => api.post('/payroll/calculate', data);
export const autoCalculatePayroll = (data) => api.post('/payroll/auto-calculate', data);
export const deletePayroll = (id) => api.delete(`/payroll/${id}`);
