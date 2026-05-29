import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [nguoiDung, setNguoiDung] = useState(null);
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const thongTinNguoiDung = localStorage.getItem('nguoiDung');
    if (token && thongTinNguoiDung) {
      setNguoiDung(JSON.parse(thongTinNguoiDung));
    }
    setDangTai(false);
  }, []);

  async function dangNhap(tenTaiKhoan, matKhau) {
    const response = await apiClient.post('/auth/dang-nhap', { tenTaiKhoan, matKhau });
    const { token, nguoiDung: thongTin } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('nguoiDung', JSON.stringify(thongTin));
    setNguoiDung(thongTin);
    return thongTin;
  }

  function dangXuat() {
    localStorage.removeItem('token');
    localStorage.removeItem('nguoiDung');
    setNguoiDung(null);
  }

  return (
    <AuthContext.Provider value={{ nguoiDung, dangTai, dangNhap, dangXuat }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
