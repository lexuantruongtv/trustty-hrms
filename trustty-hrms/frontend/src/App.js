import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import DangNhapTrang from './pages/DangNhapTrang';
import DashboardTrang from './pages/DashboardTrang';
import NhanVienTrang from './pages/NhanVienTrang';
import PhongBanTrang from './pages/PhongBanTrang';
import ChucVuTrang from './pages/ChucVuTrang';
import DuAnTrang from './pages/DuAnTrang';
import ChamCongTrang from './pages/ChamCongTrang';
import NghiPhepTrang from './pages/NghiPhepTrang';
import BangLuongTrang from './pages/BangLuongTrang';
import ThongKeTrang from './pages/ThongKeTrang';
import HoSoCaNhanTrang from './pages/HoSoCaNhanTrang';

const chuDe = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#e53935' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function TuyenDuongBaoVe({ children }) {
  const { nguoiDung, dangTai } = useAuth();
  if (dangTai) return null;
  return nguoiDung ? children : <Navigate to="/dang-nhap" replace />;
}

function App() {
  return (
    <ThemeProvider theme={chuDe}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/dang-nhap" element={<DangNhapTrang />} />
              <Route
                path="/"
                element={
                  <TuyenDuongBaoVe>
                    <Layout />
                  </TuyenDuongBaoVe>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardTrang />} />
                <Route path="nhan-vien" element={<NhanVienTrang />} />
                <Route path="phong-ban" element={<PhongBanTrang />} />
                <Route path="chuc-vu" element={<ChucVuTrang />} />
                <Route path="du-an" element={<DuAnTrang />} />
                <Route path="cham-cong" element={<ChamCongTrang />} />
                <Route path="nghi-phep" element={<NghiPhepTrang />} />
                <Route path="bang-luong" element={<BangLuongTrang />} />
                <Route path="thong-ke" element={<ThongKeTrang />} />
                <Route path="ho-so-ca-nhan" element={<HoSoCaNhanTrang />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
