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
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardStats } from '../api/dashboard';
import StatCard from '../components/common/StatCard';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../utils/format';
import useAuthStore from '../store/authStore';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { title: 'Tổng nhân viên', value: stats.tongNV, icon: <PeopleIcon />, color: '#6366f1', trend: 'Đang làm việc' },
    { title: 'Phòng ban', value: stats.tongPB, icon: <BusinessIcon />, color: '#ec4899' },
    { title: 'Dự án đang chạy', value: stats.tongDA, icon: <FolderIcon />, color: '#f59e0b' },
    { title: 'Nghỉ phép chờ duyệt', value: stats.nghiPhepChoduyet, icon: <EventBusyIcon />, color: '#ef4444' },
    { title: 'Tổng lương tháng', value: formatCurrency(stats.tongLuong), icon: <PaymentsIcon />, color: '#10b981' },
    { title: 'Chấm công hôm nay', value: stats.chamCongHomNay, icon: <AccessTimeIcon />, color: '#3b82f6' },
  ] : [];

  return (
    <Box>
      <PageHeader
        title={`Xin chào, ${user?.TenNV} 👋`}
        subtitle="Tổng quan hệ thống TrustTY HRMS"
      />

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading
          ? Array(6).fill(0).map((_, i) => (
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

      {/* Charts */}
      {!loading && stats && (
        <Grid container spacing={3}>
          {/* Bar chart - nhân viên theo phòng ban */}
          <Grid item xs={12} md={7}>
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

          {/* Pie chart - nghỉ phép */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Nghỉ phép theo tháng</Typography>
                {stats.nghiPhep6Thang.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={stats.nghiPhep6Thang} dataKey="soLuong" nameKey="thang" cx="50%" cy="50%" outerRadius={90} label={({ thang, soLuong }) => `T${thang}: ${soLuong}`}>
                        {stats.nghiPhep6Thang.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
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
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
