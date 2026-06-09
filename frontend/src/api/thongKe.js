import api from './axios';
export const getThongKeDuAn = (params) => api.get('/thong-ke/du-an', { params });
export const getBangLuongCongTy = (params) => api.get('/thong-ke/bang-luong', { params });
export const getChiPhiTheoPhongBan = (params) => api.get('/thong-ke/chi-phi-phong-ban', { params });
export const getChiPhiTheoDuAn = (params) => api.get('/thong-ke/chi-phi-du-an', { params });
export const getChenhLech = (params) => api.get('/thong-ke/chenh-lech', { params });
export const getChiPhiHoatDong = (params) => api.get('/thong-ke/chi-phi-hoat-dong', { params });
export const createChiPhiHoatDong = (data) => api.post('/thong-ke/chi-phi-hoat-dong', data);
export const deleteChiPhiHoatDong = (id) => api.delete(`/thong-ke/chi-phi-hoat-dong/${id}`);
