import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid2 as Grid, Typography, Tab, Tabs, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Chip, MenuItem, Select,
  FormControl, InputLabel, Stack,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/format';
import { getThongKeDuAn, getBangLuongCongTy } from '../api/thongKe';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const SummaryCard = ({ label, value, color = '#6366f1' }) => (
  <Card sx={{ borderTop: `4px solid ${color}` }}>
    <CardContent>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6" fontWeight={700} sx={{ color }}>{value}</Typography>
    </CardContent>
  </Card>
);

// ── Tab 1: Thống kê dự án ──────────────────────────────────────────────────
const TabDuAn = () => {
  const [data, setData] = useState(null);
  const [nam, setNam] = useState('');

  const fetch = useCallback(async () => {
    const res = await getThongKeDuAn(nam ? { nam } : {});
    setData(res.data.data);
  }, [nam]);

  useEffect(() => { fetch(); }, [fetch]);

  const trangThaiColor = (t) => ({ 'Hoàn thành': 'success', 'Đang thực hiện': 'primary', 'Tạm dừng': 'warning', 'Hủy': 'error' }[t] || 'default');

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Năm</InputLabel>
          <Select value={nam} label="Năm" onChange={(e) => setNam(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {data && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 3 }}><SummaryCard label="Tổng doanh thu" value={formatCurrency(data.tongDoanhThu)} color="#6366f1" /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><SummaryCard label="Tổng chi phí thực tế" value={formatCurrency(data.tongChiPhiThucTe)} color="#f59e0b" /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><SummaryCard label="Lợi nhuận" value={formatCurrency(data.tongLoiNhuan)} color={data.tongLoiNhuan >= 0 ? '#10b981' : '#ef4444'} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><SummaryCard label="Tiết kiệm chi phí" value={formatCurrency(data.tongChenhLech)} color={data.tongChenhLech >= 0 ? '#3b82f6' : '#ef4444'} /></Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography fontWeight={700} mb={2}>Doanh thu vs Chi phí thực tế (theo dự án)</Typography>
                  <Box sx={{ display: 'flex', gap: 3, mb: 1.5, flexWrap: 'wrap' }}>
                    {[{ color: '#6366f1', label: 'Doanh thu' }, { color: '#f59e0b', label: 'Chi phí TT' }, { color: '#10b981', label: 'Lợi nhuận' }].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: item.color, flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.items} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="TenDA" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} height={50} />
                      <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Bar dataKey="DoanhThu" fill="#6366f1" name="Doanh thu" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ChiPhiThucTe" fill="#f59e0b" name="Chi phí TT" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="LoiNhuan" fill="#10b981" name="Lợi nhuận" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                    <TableCell>Dự án</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Doanh thu</TableCell>
                    <TableCell align="right">Chi phí TT</TableCell>
                    <TableCell align="right">Lợi nhuận</TableCell>
                    <TableCell align="right">Tiết kiệm CP</TableCell>
                    <TableCell align="center">Tiến độ</TableCell>
                    <TableCell align="center">NV</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.length === 0
                    ? <TableRow><TableCell colSpan={7}><EmptyState message="Chưa có dự án hoàn thành" /></TableCell></TableRow>
                    : data.items.map((da) => (
                      <TableRow key={da.MaDOAN} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{da.TenDA}</TableCell>
                        <TableCell><Chip label={da.TrangThai} color={trangThaiColor(da.TrangThai)} size="small" /></TableCell>
                        <TableCell align="right" sx={{ color: '#6366f1', fontWeight: 600 }}>{formatCurrency(da.DoanhThu)}</TableCell>
                        <TableCell align="right">{formatCurrency(da.ChiPhiThucTe)}</TableCell>
                        <TableCell align="right" sx={{ color: da.LoiNhuan >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                          {da.LoiNhuan >= 0 ? '+' : ''}{formatCurrency(da.LoiNhuan)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: da.ChenhLech >= 0 ? 'info.main' : 'error.main' }}>
                          {da.ChenhLech >= 0 ? '+' : ''}{formatCurrency(da.ChenhLech)}
                        </TableCell>
                        <TableCell align="center">{da.TienDo}%</TableCell>
                        <TableCell align="center">{da.SoNhanVien}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </Box>
  );
};

// ── Tab 2: Bảng lương công ty ──────────────────────────────────────────────
const TabBangLuong = () => {
  const [data, setData] = useState(null);
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(CURRENT_YEAR);

  const fetch = useCallback(async () => {
    const res = await getBangLuongCongTy({ thang, nam });
    setData(res.data.data);
  }, [thang, nam]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Tháng</InputLabel>
          <Select value={thang} label="Tháng" onChange={(e) => setThang(e.target.value)}>
            {MONTHS.map((m) => <MenuItem key={m} value={m}>Tháng {m}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Năm</InputLabel>
          <Select value={nam} label="Năm" onChange={(e) => setNam(e.target.value)}>
            {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {data && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}><SummaryCard label="Tổng lương cơ bản" value={formatCurrency(data.tongLuongCB)} color="#6366f1" /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><SummaryCard label="Tổng phụ cấp" value={formatCurrency(data.tongPhuCap)} color="#f59e0b" /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><SummaryCard label="Tổng thuế TNCN" value={formatCurrency(data.tongThue)} color="#ef4444" /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><SummaryCard label="Tổng thực lĩnh" value={formatCurrency(data.tongThucLinh)} color="#10b981" /></Grid>
          </Grid>

          <Card>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                    <TableCell>Nhân viên</TableCell>
                    <TableCell>Phòng ban</TableCell>
                    <TableCell align="right">Lương CB</TableCell>
                    <TableCell align="right">Phụ cấp</TableCell>
                    <TableCell align="right">Thuế TNCN</TableCell>
                    <TableCell align="right">Thực lĩnh</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.length === 0
                    ? <TableRow><TableCell colSpan={6}><EmptyState message={`Chưa có dữ liệu lương tháng ${thang}/${nam}`} /></TableCell></TableRow>
                    : data.items.map((r) => (
                      <TableRow key={r.MaBL} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{r.TenNV}</TableCell>
                        <TableCell>{r.TenPB}</TableCell>
                        <TableCell align="right">{formatCurrency(r.LuongCB)}</TableCell>
                        <TableCell align="right">{formatCurrency(r.PhuCap)}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>{formatCurrency(r.ThueTNCN)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatCurrency(r.ThucLinh)}</TableCell>
                      </TableRow>
                    ))}
                  {data.items.length > 0 && (
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Tổng cộng</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(data.tongLuongCB)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(data.tongPhuCap)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{formatCurrency(data.tongThue)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatCurrency(data.tongThucLinh)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </Box>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────
const Statistics = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <PageHeader title="Thống kê & Báo cáo" subtitle="Phân tích chi phí, doanh thu và nhân sự toàn công ty" />
      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }} variant="scrollable">
          <Tab label="Thống kê dự án" />
          <Tab label="Bảng lương công ty" />
        </Tabs>
      </Card>
      <Box>
        {tab === 0 && <TabDuAn />}
        {tab === 1 && <TabBangLuong />}
      </Box>
    </Box>
  );
};

export default Statistics;
