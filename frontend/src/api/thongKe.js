import api from './axios';
export const getThongKeDuAn = (params) => api.get('/thong-ke/du-an', { params });
export const getBangLuongCongTy = (params) => api.get('/thong-ke/bang-luong', { params });
export const getChiPhiTheoPhongBan = (params) => api.get('/thong-ke/chi-phi-phong-ban', { params });
export const getChiPhiTheoDuAn = (params) => api.get('/thong-ke/chi-phi-du-an', { params });
