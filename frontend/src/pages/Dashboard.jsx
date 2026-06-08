import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import FolderIcon from '@mui/icons-material/Folder';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getDashboardStats } from '../api/dashboard';
import StatCard from '../components/common/StatCard';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../utils/format';
import useAuthStore from '../store/authStore';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const ChartNghiPhep = ({ data }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={3}>Nghỉ phép theo tháng</Typography>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} dataKey="soLuong" nameKey="thang" cx="50%" cy="50%" outerRadius={90}
              label={({ thang, soLuong }) => `T${thang}: ${soLuong}`}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
          <Typography color="text.secondary">Chưa có dữ liệu</Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      getDashboardStats()
        .then((r) => setStats(r.data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const role = user?.PhanQuyen;

  // Cards theo role
  const getCards = () => {
    if (!stats) return [];
    if (role === 'Employee') return [
      { title: 'Chấm công hôm nay', value: stats.chamCongHomNay ? 'Đã chấm' : 'Chưa chấm', icon: <AccessTimeIcon />, color: stats.chamCongHomNay ? '#10b981' : '#ef4444' },
      { title: 'Nghỉ phép chờ duyệt', value: stats.nghiPhepChoduyet, icon: <EventBusyIcon />, color: '#f59e0b' },
      { title: 'Lương gần nhất', value: formatCurrency(stats.tongLuong), icon: <PaymentsIcon />, color: '#6366f1', trend: `Tháng ${stats.luongThang}/${stats.luongNam}` },
    ];
    if (role === 'Manager') return [
      { title: 'Nhân viên phòng ban', value: stats.tongNV, icon: <PeopleIcon />, color: '#6366f1', trend: 'Đang làm việc' },
      { title: 'Dự án đang chạy', value: stats.tongDA, icon: <FolderIcon />, color: '#f59e0b' },
      { title: 'Nghỉ phép chờ duyệt', value: stats.nghiPhepChoduyet, icon: <EventBusyIcon />, color: '#ef4444' },
      { title: 'Chấm công hôm nay', value: stats.chamCongHomNay, icon: <AccessTimeIcon />, color: '#3b82f6' },
    ];
    // Admin / HR
    return [
      { title: 'Tổng nhân viên', value: stats.tongNV, icon: <PeopleIcon />, color: '#6366f1', trend: 'Đang làm việc' },
      { title: 'Phòng ban', value: stats.tongPB, icon: <BusinessIcon />, color: '#ec4899' },
      { title: 'Dự án đang chạy', value: stats.tongDA, icon: <FolderIcon />, color: '#f59e0b' },
      { title: 'Nghỉ phép chờ duyệt', value: stats.nghiPhepChoduyet, icon: <EventBusyIcon />, color: '#ef4444' },
      { title: 'Tổng lương tháng', value: formatCurrency(stats.tongLuong), icon: <PaymentsIcon />, color: '#10b981', trend: `Tháng ${stats.luongThang}/${stats.luongNam}` },
      { title: 'Chấm công hôm nay', value: stats.chamCongHomNay, icon: <AccessTimeIcon />, color: '#3b82f6' },
    ];
  };

  const cards = getCards();
  const skeletonCount = role === 'Employee' ? 3 : role === 'Manager' ? 4 : 6;

  return (
    <Box>
      <PageHeader
        title={`Xin chào, ${user?.TenNV} 👋`}
        subtitle="Tổng quan hệ thống TrustTY HRMS"
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading
          ? Array(skeletonCount).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
            </Grid>
          ))
          : cards.map((c, i) => (
            <Grid item xs={12} sm={6} md={4} key={c.title}>
              <StatCard {...c} index={i} />
            </Grid>
          ))
        }
      </Grid>

      {!loading && stats && (
        <Grid container spacing={3}>
          {/* Biểu đồ NV theo phòng ban — chỉ Admin/HR */}
          {(role === 'Admin' || role === 'HR') && stats.nvTheoPB?.length > 0 && (
            <Grid item xs={12} md={role === 'Employee' ? 12 : 7}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>Nhân viên theo phòng ban</Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.nvTheoPB} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="TenPB" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="soNV" fill="#6366f1" radius={[6, 6, 0, 0]} name="Nhân viên" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Biểu đồ nghỉ phép — chỉ Admin/HR/Employee */}
          {role !== 'Manager' && stats.nghiPhep6Thang && (
            <Grid item xs={12} md={role === 'Admin' || role === 'HR' ? 5 : 12}>
              <ChartNghiPhep data={stats.nghiPhep6Thang} />
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
