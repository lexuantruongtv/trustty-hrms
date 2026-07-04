import api from './axios';

export const getProjects = (params) => api.get('/projects', { params });
export const getMyProjects = () => api.get('/projects/my');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const assignMember = (id, data) => api.post(`/projects/${id}/assign`, data);
export const checkMemberBusy = (id, maNV1) => api.get(`/projects/${id}/check-busy/${maNV1}`);
export const removeAssign = (id, maNV1) => api.delete(`/projects/${id}/assign/${maNV1}`);
export const addNote = (id, data) => api.post(`/projects/${id}/notes`, data);
export const getNotes = (id) => api.get(`/projects/${id}/notes`);
export const getNvChuaThamGia = () => api.get('/projects/nv-chua-tham-gia');
