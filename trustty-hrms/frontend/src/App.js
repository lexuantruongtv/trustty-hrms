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

// Bảo vệ route: yêu cầu đăng nhập
function TuyenDuongBaoVe({ children }) {
  const { nguoiDung, dangTai } = useAuth();
  if (dangTai) return null;
  return nguoiDung ? children : <Navigate to="/dang-nhap" replace />;
}

// Bảo vệ route: yêu cầu quyền cụ thể, nếu không đủ quyền chuyển về dashboard
function TuyenDuongTheoQuyen({ danhSachQuyen, children }) {
  const { nguoiDung } = useAuth();
  if (!nguoiDung || !danhSachQuyen.includes(nguoiDung.phanQuyen)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Chuyển hướng nếu đã đăng nhập mà vào trang đăng nhập
function TuyenDuongCong() {
  const { nguoiDung, dangTai } = useAuth();
  if (dangTai) return null;
  return nguoiDung ? <Navigate to="/dashboard" replace /> : <DangNhapTrang />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/dang-nhap" element={<TuyenDuongCong />} />
      <Route
        path="/"
        element={
          <TuyenDuongBaoVe>
            <Layout />
          </TuyenDuongBaoVe>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Tất cả các quyền */}
        <Route path="dashboard" element={<DashboardTrang />} />
        <Route path="cham-cong" element={<ChamCongTrang />} />
        <Route path="nghi-phep" element={<NghiPhepTrang />} />
        <Route path="bang-luong" element={<BangLuongTrang />} />
        <Route path="ho-so-ca-nhan" element={<HoSoCaNhanTrang />} />

        {/* Admin, HR, Manager */}
        <Route
          path="nhan-vien"
          element={
            <TuyenDuongTheoQuyen danhSachQuyen={['Admin', 'HR', 'Manager']}>
              <NhanVienTrang />
            </TuyenDuongTheoQuyen>
          }
        />
        <Route
          path="du-an"
          element={
            <TuyenDuongTheoQuyen danhSachQuyen={['Admin', 'HR', 'Manager']}>
              <DuAnTrang />
            </TuyenDuongTheoQuyen>
          }
        />
        <Route
          path="thong-ke"
          element={
            <TuyenDuongTheoQuyen danhSachQuyen={['Admin', 'HR', 'Manager']}>
              <ThongKeTrang />
            </TuyenDuongTheoQuyen>
          }
        />

        {/* Chỉ Admin và HR */}
        <Route
          path="phong-ban"
          element={
            <TuyenDuongTheoQuyen danhSachQuyen={['Admin', 'HR']}>
              <PhongBanTrang />
            </TuyenDuongTheoQuyen>
          }
        />
        <Route
          path="chuc-vu"
          element={
            <TuyenDuongTheoQuyen danhSachQuyen={['Admin', 'HR']}>
              <ChucVuTrang />
            </TuyenDuongTheoQuyen>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={chuDe}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
        {/* AuthProvider bọc ngoài BrowserRouter để useAuth hoạt động trong mọi component */}
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
