import React, { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Skeleton, Chip,
  LinearProgress, Avatar, Divider, List, ListItem, ListItemAvatar,
  ListItemText, Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import FolderIcon from '@mui/icons-material/Folder';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardStats } from '../api/dashboard';
import StatCard from '../components/common/StatCard';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency, formatDate } from '../utils/format';
import useAuthStore from '../store/authStore';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

/* ── Tiến độ dự án ─────────────────────────────────────────────────────── */
const TienDoColor = (pct) => {
  if (pct >= 80) return '#10b981';
  if (pct >= 50) return '#3b82f6';
  if (pct >= 20) return '#f59e0b';
  return '#ef4444';
};

const ProjectProgressCard = ({ duAns = [] }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <FolderIcon sx={{ color: '#f59e0b' }} />
        <Typography variant="h6" fontWeight={700}>Dự án đang thực hiện</Typography>
      </Box>
      {duAns.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
          <Typography color="text.secondary" variant="body2">Chưa có dự án</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {duAns.map((da) => (
            <Box key={da.MaDOAN}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '65%' }}>
                  {da.TenDA}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {da.NgayKT && (
                    <Typography variant="caption" color="text.secondary">
                      HT: {formatDate(da.NgayKT)}
                    </Typography>
                  )}
                  <Typography variant="caption" fontWeight={700} sx={{ color: TienDoColor(da.TienDo || 0) }}>
                    {da.TienDo || 0}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={da.TienDo || 0}
                sx={{
                  height: 7, borderRadius: 4,
                  bgcolor: `${TienDoColor(da.TienDo || 0)}20`,
                  '& .MuiLinearProgress-bar': { bgcolor: TienDoColor(da.TienDo || 0), borderRadius: 4 },
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </CardContent>
  </Card>
);

/* ── Hợp đồng sắp hết hạn ──────────────────────────────────────────────── */
const HopDongSapHHCard = ({ items = [] }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysLeft = (dateStr) => {
    const diff = new Date(dateStr) - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, minWidth: 260 }}>
          <WarningAmberIcon sx={{ color: '#f59e0b', flexShrink: 0 }} />
          <Typography variant="h6" fontWeight={700} noWrap>Hợp đồng sắp hết hạn</Typography>
          {items.length > 0 && (
            <Chip label={items.length} size="small" color="warning" sx={{ ml: 'auto', flexShrink: 0 }} />
          )}
        </Box>
        {items.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, gap: 1 }}>
            <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 36 }} />
            <Typography color="text.secondary" variant="body2">Không có hợp đồng sắp hết hạn</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {items.map((h) => {
              const days = daysLeft(h.NgayHH);
              const isExpired = days < 0;
              const isUrgent = days >= 0 && days <= 7;
              const chipColor = isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : '#3b82f6';
              const chipLabel = isExpired ? `Quá hạn ${Math.abs(days)} ngày` : days === 0 ? 'Hôm nay' : `${days} ngày`;
              return (
                <Box key={h.SoHD} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  border: '1px solid', borderColor: `${chipColor}40`,
                  borderRadius: 2, px: 2, py: 1.25,
                  bgcolor: `${chipColor}08`,
                  minWidth: 240, flex: '1 1 240px',
                }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: `${chipColor}20`, flexShrink: 0 }}>
                    <AssignmentIcon sx={{ fontSize: 16, color: chipColor }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{h.TenNV}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {h.LoaiHD} · HH: {formatDate(h.NgayHH)}
                    </Typography>
                  </Box>
                  <Chip label={chipLabel} size="small" sx={{
                    bgcolor: `${chipColor}15`, color: chipColor,
                    fontWeight: 700, fontSize: 11, flexShrink: 0,
                  }} />
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/* ── Nghỉ phép chờ duyệt (Manager) ────────────────────────────────────── */
const NghiPhepChiTietCard = ({ items = [] }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EventBusyIcon sx={{ color: '#ef4444' }} />
        <Typography variant="h6" fontWeight={700}>Nghỉ phép chờ duyệt</Typography>
        {items.length > 0 && (
          <Chip label={items.length} size="small" color="error" sx={{ ml: 'auto' }} />
        )}
      </Box>
      {items.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, gap: 1 }}>
          <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 36 }} />
          <Typography color="text.secondary" variant="body2">Không có đơn chờ duyệt</Typography>
        </Box>
      ) : (
        <List dense disablePadding>
          {items.map((n, i) => (
            <React.Fragment key={n.MaDon}>
              {i > 0 && <Divider component="li" />}
              <ListItem disableGutters sx={{ py: 1 }}>
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#ef444420' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#ef4444', fontSize: 10 }}>
                      {n.TenNV?.split(' ').slice(-1)[0]?.[0] || '?'}
                    </Typography>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={600}>{n.TenNV}</Typography>}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(n.NgayBD)} → {formatDate(n.NgayKT)}
                      {n.LyDo ? ` · ${n.LyDo}` : ''}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </CardContent>
  </Card>
);

/* ── Biểu đồ lương 6 tháng ─────────────────────────────────────────────── */
const ChartLuong6Thang = ({ data = [] }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <PaymentsIcon sx={{ color: '#10b981' }} />
        <Typography variant="h6" fontWeight={700}>Lương thực lĩnh 6 tháng gần nhất</Typography>
      </Box>
      {data.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
          <Typography color="text.secondary">Chưa có dữ liệu</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="thang" tickFormatter={(t) => `T${t}`} tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} />
            <RechartsTooltip formatter={(v) => formatCurrency(v)} labelFormatter={(t) => `Tháng ${t}`} />
            <Line
              type="monotone" dataKey="tongLuong" stroke="#10b981" strokeWidth={2.5}
              dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 7 }} name="Thực lĩnh"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

/* ── Biểu đồ NV theo phòng ban ─────────────────────────────────────────── */
const ChartNVPB = ({ data = [] }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <BusinessIcon sx={{ color: '#6366f1' }} />
        <Typography variant="h6" fontWeight={700}>Nhân viên theo phòng ban</Typography>
      </Box>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="TenPB" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <RechartsTooltip />
          <Bar dataKey="soNV" fill="#6366f1" radius={[6, 6, 0, 0]} name="Nhân viên" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

/* ── Biểu đồ nghỉ phép theo tháng ─────────────────────────────────────── */
const ChartNghiPhep = ({ data = [] }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <EventBusyIcon sx={{ color: '#ec4899' }} />
        <Typography variant="h6" fontWeight={700}>Nghỉ phép theo tháng</Typography>
      </Box>
      {data.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
          <Typography color="text.secondary">Chưa có dữ liệu</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="thang" tickFormatter={(t) => `T${t}`} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <RechartsTooltip labelFormatter={(t) => `Tháng ${t}`} />
            <Bar dataKey="soLuong" fill="#ec4899" radius={[6, 6, 0, 0]} name="Đơn nghỉ phép" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

/* ── Chấm công 7 ngày (Employee) ────────────────────────────────────────── */
const ChartChamCong7Ngay = ({ data = [] }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <AccessTimeIcon sx={{ color: '#3b82f6' }} />
        <Typography variant="h6" fontWeight={700}>Giờ làm việc 7 ngày gần nhất</Typography>
      </Box>
      {data.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
          <Typography color="text.secondary">Chưa có dữ liệu chấm công</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="Ngay"
              tickFormatter={(d) => {
                const dt = new Date(d);
                return `${dt.getDate()}/${dt.getMonth() + 1}`;
              }}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 10]} />
            <RechartsTooltip
              labelFormatter={(d) => formatDate(d)}
              formatter={(v) => [`${v} giờ`, 'Giờ làm']}
            />
            <Bar dataKey="SoGioLam" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Giờ làm" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

/* ── Main Dashboard ─────────────────────────────────────────────────────── */
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

  const getCards = () => {
    if (!stats) return [];

    if (role === 'Employee') return [
      {
        title: 'Chấm công hôm nay',
        value: stats.chamCongHomNay ? 'Đã chấm' : 'Chưa chấm',
        icon: <AccessTimeIcon />,
        color: stats.chamCongHomNay ? '#10b981' : '#ef4444',
        trend: stats.chamCongHomNay ? '✓ Đúng giờ' : '⚠ Nhớ chấm công',
      },
      {
        title: 'Dự án đang tham gia',
        value: stats.duAnDangThamGia ?? '—',
        icon: <FolderIcon />,
        color: '#f59e0b',
        trend: 'Đang thực hiện',
      },
      {
        title: 'Nghỉ phép chờ duyệt',
        value: stats.nghiPhepChoduyet,
        icon: <EventBusyIcon />,
        color: '#ec4899',
        trend: 'Đơn đang chờ',
      },
      {
        title: 'Lương gần nhất',
        value: formatCurrency(stats.tongLuong),
        icon: <PaymentsIcon />,
        color: '#6366f1',
        trend: `Tháng ${stats.luongThang}/${stats.luongNam}`,
      },
    ];

    if (role === 'Manager') return [
      { title: 'Nhân viên phòng ban', value: stats.tongNV, icon: <PeopleIcon />, color: '#6366f1', trend: 'Đang làm việc' },
      { title: 'Dự án đang chạy', value: stats.tongDA, icon: <FolderIcon />, color: '#f59e0b' },
      { title: 'Nghỉ phép chờ duyệt', value: stats.nghiPhepChoduyet, icon: <EventBusyIcon />, color: '#ef4444' },
      { title: 'Chấm công hôm nay', value: stats.chamCongHomNay, icon: <AccessTimeIcon />, color: '#3b82f6', trend: 'Nhân viên' },
    ];

    // Admin / HR
    return [
      { title: 'Tổng nhân viên', value: stats.tongNV, icon: <PeopleIcon />, color: '#6366f1', trend: 'Đang làm việc' },
      { title: 'Phòng ban', value: stats.tongPB, icon: <BusinessIcon />, color: '#ec4899' },
      { title: 'Dự án đang chạy', value: stats.tongDA, icon: <FolderIcon />, color: '#f59e0b' },
      { title: 'Nghỉ phép chờ duyệt', value: stats.nghiPhepChoduyet, icon: <EventBusyIcon />, color: '#ef4444' },
      { title: 'Tổng lương tháng', value: formatCurrency(stats.tongLuong), icon: <PaymentsIcon />, color: '#10b981', trend: `Tháng ${stats.luongThang}/${stats.luongNam}` },
      { title: 'Nhân viên mới tháng này', value: stats.nvMoiThang ?? 0, icon: <PersonAddIcon />, color: '#3b82f6', trend: 'Hợp đồng ký mới' },
    ];
  };

  const cards = getCards();
  const skeletonCount = role === 'Employee' ? 4 : role === 'Manager' ? 4 : 6;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <Box>
      <PageHeader
        title={`${greeting()}, ${user?.TenNV} 👋`}
        subtitle="Tổng quan hệ thống TrustTY HRMS"
      />

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading
          ? Array(skeletonCount).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} md={role === 'Employee' ? 3 : 4} key={i}>
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
            </Grid>
          ))
          : cards.map((c, i) => (
            <Grid item xs={12} sm={6} md={role === 'Employee' ? 3 : 4} key={c.title}>
              <StatCard {...c} index={i} />
            </Grid>
          ))
        }
      </Grid>

      {/* Charts & Details */}
      {!loading && stats && (
        <>
          {/* EMPLOYEE */}
          {role === 'Employee' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <ChartLuong6Thang data={stats.luong6Thang} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ChartChamCong7Ngay data={stats.chamCong7Ngay} />
              </Grid>
              {stats.nghiPhep6Thang?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <ChartNghiPhep data={stats.nghiPhep6Thang} />
                </Grid>
              )}
            </Grid>
          )}

          {/* MANAGER */}
          {role === 'Manager' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ProjectProgressCard duAns={stats.duAnDangChay || []} />
              </Grid>
              <Grid item xs={12} md={6}>
                <NghiPhepChiTietCard items={stats.nghiPhepChiTiet || []} />
              </Grid>
              {stats.nghiPhep6Thang?.length > 0 && (
                <Grid item xs={12}>
                  <ChartNghiPhep data={stats.nghiPhep6Thang} />
                </Grid>
              )}
            </Grid>
          )}

          {/* ADMIN / HR */}
          {(role === 'Admin' || role === 'HR') && (
            <Grid container spacing={3}>
              {/* Row 1 */}
              <Grid item xs={12} md={8}>
                <ChartLuong6Thang data={stats.luong6Thang} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ChartNghiPhep data={stats.nghiPhep6Thang || []} />
              </Grid>

              {/* Row 2 */}
              <Grid item xs={12} md={6}>
                <ChartNVPB data={stats.nvTheoPB || []} />
              </Grid>
              <Grid item xs={12} md={6}>
                <ProjectProgressCard duAns={stats.duAnDangChay || []} />
              </Grid>

              {/* Row 3 */}
              <Grid item xs={12}>
                <HopDongSapHHCard items={stats.hopDongSapHH || []} />
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default Dashboard;
