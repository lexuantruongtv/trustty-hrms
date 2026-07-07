import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Avatar, CircularProgress, Chip, TextField, InputAdornment, MenuItem,
  FormControl, InputLabel, Select,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { getAttendance, checkIn, checkOut, getTodayStatus } from '../api/attendance';
import { getDepartments } from '../api/departments';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';
import useAuthStore from '../store/authStore';
import { formatDate, getInitials } from '../utils/format';

const TRANG_THAI = [
  { value: '', label: 'Tất cả' },
  { value: 'hoanThanh', label: 'Hoàn thành' },
  { value: 'dangLam', label: 'Đang làm' },
  { value: 'diTre', label: 'Đi trễ' },
];

const Attendance = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [todayStatus, setTodayStatus] = useState(null);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  // Filter states
  const [tenNV, setTenNV] = useState('');
  const [thang, setThang] = useState('');
  const [nam, setNam] = useState('');
  const [maPB, setMaPB] = useState('');
  const [trangThai, setTrangThai] = useState('');
  const [phongBans, setPhongBans] = useState([]);

  const debouncedTenNV = useDebounce(tenNV);

  const isEmployee = user?.PhanQuyen === 'Employee';

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isEmployee) {
      getDepartments()
        .then((r) => {
          // API trả về array trực tiếp hoặc data.items
          const list = r.data.data?.items || r.data.data || r.data || [];
          setPhongBans(Array.isArray(list) ? list : []);
        })
        .catch(() => {});
    }
  }, [isEmployee]);

  const fetchToday = () => getTodayStatus().then((r) => setTodayStatus(r.data.data)).catch(() => {});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: 10,
        MaNV1: isEmployee ? user.MaNV1 : undefined,
        tenNV: debouncedTenNV || undefined,
        thang: thang || undefined,
        nam: nam || undefined,
        MaPB: maPB || undefined,
        trangThai: trangThai || undefined,
      };
      const res = await getAttendance(params);
      setData(res.data.data);
    } catch { } finally { setLoading(false); }
  }, [page, user, isEmployee, debouncedTenNV, thang, nam, maPB, trangThai]);

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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

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

      {/* Filter section */}
      {!isEmployee && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Tìm kiếm nhân viên..."
              size="small"
              sx={{ minWidth: 240 }}
              value={tenNV}
              onChange={(e) => { setTenNV(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Tháng</InputLabel>
              <Select value={thang} label="Tháng" onChange={(e) => { setThang(e.target.value); setPage(0); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {months.map((m) => <MenuItem key={m} value={m}>Tháng {m}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Năm</InputLabel>
              <Select value={nam} label="Năm" onChange={(e) => { setNam(e.target.value); setPage(0); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Phòng ban</InputLabel>
              <Select value={maPB} label="Phòng ban" onChange={(e) => { setMaPB(e.target.value); setPage(0); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {phongBans.map((pb) => <MenuItem key={pb.MaPB} value={pb.MaPB}>{pb.TenPB}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select value={trangThai} label="Trạng thái" onChange={(e) => { setTrangThai(e.target.value); setPage(0); }}>
                {TRANG_THAI.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Card>
      )}

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
              ) : data.items.map((cc) => {
                const isDiTre = cc.GioVao && cc.GioVao > '08:00:00';
                return (
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
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {cc.GioVao || '—'}
                        {isDiTre && (
                          <Chip label="Trễ" size="small" color="error" sx={{ height: 18, fontSize: 10 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{cc.GioRa || '—'}</TableCell>
                    <TableCell>
                      {cc.SoGioLam ? (
                        <Chip
                          label={`${cc.SoGioLam}h`}
                          size="small"
                          color={cc.SoGioLam < 8 ? 'warning' : 'primary'}
                        />
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cc.GioRa ? 'Hoàn thành' : 'Đang làm'}
                        size="small"
                        color={cc.GioRa ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
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
