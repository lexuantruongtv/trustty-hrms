import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Avatar, CircularProgress, Chip,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';
import { getAttendance, checkIn, checkOut, getTodayStatus } from '../api/attendance';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';
import { formatDate, getInitials } from '../utils/format';

const Attendance = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [todayStatus, setTodayStatus] = useState(null);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchToday = () => getTodayStatus().then((r) => setTodayStatus(r.data.data)).catch(() => {});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: 10, MaNV1: user?.PhanQuyen === 'Employee' ? user.MaNV1 : undefined };
      const res = await getAttendance(params);
      setData(res.data.data);
    } catch { } finally { setLoading(false); }
  }, [page, user]);

  useEffect(() => { fetchToday(); fetchData(); }, [fetchData]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try { await checkIn(); toast.success('Check-in thành công!'); fetchToday(); fetchData(); }
    catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try { await checkOut(); toast.success('Check-out thành công!'); fetchToday(); fetchData(); }
    catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setActionLoading(false); }
  };

  const canCheckIn = !todayStatus;
  const canCheckOut = todayStatus && !todayStatus.GioRa;

  return (
    <Box>
      <PageHeader title="Chấm công" subtitle="Quản lý giờ làm việc" />

      {/* Check-in/out card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {now.toLocaleTimeString('vi-VN')}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.85, mt: 0.5 }}>
                  {now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {todayStatus && (
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 2, minWidth: 140 }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Giờ vào</Typography>
                      <Typography variant="h6" fontWeight={700}>{todayStatus.GioVao || '—'}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Giờ ra</Typography>
                      <Typography variant="h6" fontWeight={700}>{todayStatus.GioRa || '—'}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, justifyContent: 'center' }}>
                    <Button
                      variant="contained" startIcon={<LoginIcon />}
                      disabled={!canCheckIn || actionLoading}
                      onClick={handleCheckIn}
                      sx={{ bgcolor: 'white', color: '#6366f1', '&:hover': { bgcolor: '#f0f0ff' }, fontWeight: 700 }}
                    >
                      Check-in
                    </Button>
                    <Button
                      variant="outlined" startIcon={<LogoutIcon />}
                      disabled={!canCheckOut || actionLoading}
                      onClick={handleCheckOut}
                      sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      Check-out
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* History table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Giờ vào</TableCell>
                <TableCell>Giờ ra</TableCell>
                <TableCell>Số giờ làm</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
              ) : data.items.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState message="Chưa có dữ liệu chấm công" /></TableCell></TableRow>
              ) : data.items.map((cc) => (
                <TableRow key={cc.MaCC} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1', fontSize: 12 }}>
                        {getInitials(cc.nhanVien?.TenNV)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{cc.nhanVien?.TenNV}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[cc.nhanVien?.chucVu?.TenCV, cc.nhanVien?.phongBan?.TenPB].filter(Boolean).join(' · ')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(cc.Ngay)}</TableCell>
                  <TableCell>{cc.GioVao || '—'}</TableCell>
                  <TableCell>{cc.GioRa || '—'}</TableCell>
                  <TableCell>
                    {cc.SoGioLam ? <Chip label={`${cc.SoGioLam}h`} size="small" color="primary" /> : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cc.GioRa ? 'Hoàn thành' : 'Đang làm'}
                      size="small"
                      color={cc.GioRa ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={data.total} page={page} rowsPerPage={10}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPageOptions={[10]}
          labelRowsPerPage="Hàng/trang"
        />
      </Card>
    </Box>
  );
};

export default Attendance;
