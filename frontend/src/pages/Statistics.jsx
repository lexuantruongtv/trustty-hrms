import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid2 as Grid, Typography, Tab, Tabs, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Chip, MenuItem, Select,
  FormControl, InputLabel, Stack, Button, IconButton, Tooltip, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine,
} from 'recharts';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/format';
import { getThongKeDuAn, getBangLuongCongTy, getChenhLech, getChiPhiHoatDong, createChiPhiHoatDong, deleteChiPhiHoatDong } from '../api/thongKe';

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

  const loadData = useCallback(async () => {
    try {
      const res = await getThongKeDuAn(nam ? { nam } : {});
      setData(res.data.data);
    } catch { setData({ items: [], tongDoanhThu: 0, tongChiPhiThucTe: 0, tongLoiNhuan: 0, tongChenhLech: 0 }); }
  }, [nam]);

  useEffect(() => { loadData(); }, [loadData]);

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
                      <RechartsTooltip formatter={(v) => formatCurrency(v)} />
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
  const [thang, setThang] = useState(8);
  const [nam, setNam] = useState(2025);

  const loadData = useCallback(async () => {
    try {
      const res = await getBangLuongCongTy({ thang, nam });
      setData(res.data.data);
    } catch { setData({ items: [], tongLuongCB: 0, tongPhuCap: 0, tongThue: 0, tongPhiBH: 0, tongThucLinh: 0 }); }
  }, [thang, nam]);

  useEffect(() => { loadData(); }, [loadData]);

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
            <Grid size={{ xs: 6, sm: 2.4 }}><SummaryCard label="Tổng lương cơ bản" value={formatCurrency(data.tongLuongCB)} color="#6366f1" /></Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}><SummaryCard label="Tổng phụ cấp" value={formatCurrency(data.tongPhuCap)} color="#f59e0b" /></Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}><SummaryCard label="Tổng thuế TNCN" value={formatCurrency(data.tongThue)} color="#ef4444" /></Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}><SummaryCard label="Phí BH (10.5%)" value={formatCurrency(data.tongPhiBH)} color="#8b5cf6" /></Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}><SummaryCard label="Tổng thực lĩnh" value={formatCurrency(data.tongThucLinh)} color="#10b981" /></Grid>
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
                    <TableCell align="right">Phí BH (10.5%)</TableCell>
                    <TableCell align="right">Thực lĩnh</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.length === 0
                    ? <TableRow><TableCell colSpan={7}><EmptyState message={`Chưa có dữ liệu lương tháng ${thang}/${nam}`} /></TableCell></TableRow>
                    : data.items.map((r) => (
                      <TableRow key={r.MaBL} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{r.TenNV}</TableCell>
                        <TableCell>{r.TenPB}</TableCell>
                        <TableCell align="right">{formatCurrency(r.LuongCB)}</TableCell>
                        <TableCell align="right">{formatCurrency(r.PhuCap)}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>{formatCurrency(r.ThueTNCN)}</TableCell>
                        <TableCell align="right" sx={{ color: '#8b5cf6' }}>{formatCurrency(r.PhiBH)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatCurrency(r.ThucLinh)}</TableCell>
                      </TableRow>
                    ))}
                  {data.items.length > 0 && (
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Tổng cộng</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(data.tongLuongCB)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(data.tongPhuCap)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{formatCurrency(data.tongThue)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#8b5cf6' }}>{formatCurrency(data.tongPhiBH)}</TableCell>
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

// ── Tab 3: Thống kê chênh lệch ────────────────────────────────────────────
const LOAI_CHI_PHI = ['Thuê văn phòng', 'Điện nước', 'Thiết bị & CCDC', 'Marketing', 'Đào tạo', 'Khác'];

const TabChenhLech = () => {
  const [data, setData] = useState(null);
  const [chiPhis, setChiPhis] = useState([]);
  const [nam, setNam] = useState(CURRENT_YEAR);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ Thang: new Date().getMonth() + 1, Nam: CURRENT_YEAR, LoaiChiPhi: '', SoTien: '', GhiChu: '' });

  const loadData = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([getChenhLech({ nam }), getChiPhiHoatDong({ nam })]);
      setData(r1.data.data);
      setChiPhis(r2.data.data || []);
    } catch { setData({ items: [], tongDoanhThuNam: 0, tongChiPhi: 0, ketQua: 0, thuaLo: false, nam }); }
  }, [nam]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    if (!form.LoaiChiPhi || !form.SoTien) return;
    try {
      await createChiPhiHoatDong({ ...form, SoTien: +form.SoTien });
      setFormOpen(false);
      setForm({ Thang: new Date().getMonth() + 1, Nam: CURRENT_YEAR, LoaiChiPhi: '', SoTien: '', GhiChu: '' });
      loadData();
    } catch { }
  };

  const handleDelete = async (id) => {
    try { await deleteChiPhiHoatDong(id); loadData(); } catch { }
  };

  const chartData = data?.items?.map((r) => ({
    name: `T${r.thang}`,
    'Doanh thu tháng': r.doanhThuThang,
    'Chi phí tháng': r.tongChiPhi,
    'Số dư tích lũy': r.soDuTichLuy,
  })) || [];

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Năm</InputLabel>
          <Select value={nam} label="Năm" onChange={(e) => setNam(e.target.value)}>
            {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {data && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}><SummaryCard label="Tổng doanh thu cả năm" value={formatCurrency(data.tongDoanhThuNam)} color="#6366f1" /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><SummaryCard label="Tổng chi phí" value={formatCurrency(data.tongChiPhi)} color="#f59e0b" /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ borderTop: `4px solid ${data.thuaLo ? '#ef4444' : '#10b981'}` }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Kết quả cuối năm</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: data.thuaLo ? '#ef4444' : '#10b981' }}>
                    {formatCurrency(data.ketQua)}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: data.thuaLo ? '#ef4444' : '#10b981' }}>
                    {data.thuaLo ? '⚠️ Công ty đang thua lỗ' : '✅ Công ty có lãi'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {chartData.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography fontWeight={700} mb={0.5}>
                  Số dư tích lũy theo tháng năm {nam}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Số dư tích lũy = Doanh thu tháng - Chi phí tháng + Số dư tháng trước
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, mb: 1.5, flexWrap: 'wrap' }}>
                  {[{ color: '#10b981', label: 'Doanh thu tháng' }, { color: '#f59e0b', label: 'Chi phí tháng' }, { color: '#6366f1', label: 'Số dư tích lũy' }].map((i) => (
                    <Box key={i.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: i.color, flexShrink: 0 }} />
                      <Typography variant="caption" color="text.secondary">{i.label}</Typography>
                    </Box>
                  ))}
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(v) => formatCurrency(v)} />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Hòa vốn', position: 'insideTopRight', fontSize: 11, fill: '#ef4444' }} />
                    <Line type="monotone" dataKey="Doanh thu tháng" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Chi phí tháng" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Số dư tích lũy" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5 }} activeDot={{ r: 7 }}
                      label={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {chartData.length === 0 && <EmptyState message={`Chưa có dữ liệu năm ${nam}`} />}

          {/* Bảng chi tiết */}
          {chartData.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                      <TableCell>Tháng</TableCell>
                      <TableCell align="right" sx={{ color: '#10b981' }}>Doanh thu</TableCell>
                      <TableCell align="right">CP dự án</TableCell>
                      <TableCell align="right">Lương NV</TableCell>
                      <TableCell align="right">CP hoạt động</TableCell>
                      <TableCell align="right">Tổng chi phí tháng</TableCell>
                      <TableCell align="right">Số dư tích lũy</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.items.map((r) => (
                      <TableRow key={r.thang} hover>
                        <TableCell sx={{ fontWeight: 600 }}>Tháng {r.thang}/{r.nam}</TableCell>
                        <TableCell align="right" sx={{ color: '#10b981', fontWeight: 600 }}>{r.doanhThuThang > 0 ? `+${formatCurrency(r.doanhThuThang)}` : '—'}</TableCell>
                        <TableCell align="right">{formatCurrency(r.chiPhiDuAn)}</TableCell>
                        <TableCell align="right">{formatCurrency(r.tongLuong)}</TableCell>
                        <TableCell align="right">{formatCurrency(r.chiPhiHD)}</TableCell>
                        <TableCell align="right" sx={{ color: 'warning.main', fontWeight: 600 }}>-{formatCurrency(r.tongChiPhi)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: r.soDuTichLuy >= 0 ? 'success.main' : 'error.main' }}>
                          {formatCurrency(r.soDuTichLuy)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {/* Bảng chi phí hoạt động */}
          <Card>
            <CardContent sx={{ pb: '8px !important', pt: 2, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography fontWeight={700}>Chi phí hoạt động đã nhập năm {nam}</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
                  Thêm chi phí HĐ
                </Button>
              </Box>
            </CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                    <TableCell>Tháng</TableCell>
                    <TableCell>Loại chi phí</TableCell>
                    <TableCell align="right">Số tiền</TableCell>
                    <TableCell>Ghi chú</TableCell>
                    <TableCell align="center">Xóa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chiPhis.length === 0
                    ? <TableRow><TableCell colSpan={5}><EmptyState message="Chưa có chi phí hoạt động" /></TableCell></TableRow>
                    : chiPhis.map((cp) => (
                      <TableRow key={cp.MaCPHD} hover>
                        <TableCell>T{cp.Thang}/{cp.Nam}</TableCell>
                        <TableCell>{cp.LoaiChiPhi}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>{formatCurrency(cp.SoTien)}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{cp.GhiChu || '—'}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Xóa">
                            <IconButton size="small" color="error" onClick={() => handleDelete(cp.MaCPHD)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {/* Dialog thêm chi phí */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm chi phí hoạt động</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tháng</InputLabel>
                <Select value={form.Thang} label="Tháng" onChange={(e) => setForm((f) => ({ ...f, Thang: e.target.value }))}>
                  {MONTHS.map((m) => <MenuItem key={m} value={m}>Tháng {m}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Năm</InputLabel>
                <Select value={form.Nam} label="Năm" onChange={(e) => setForm((f) => ({ ...f, Nam: e.target.value }))}>
                  {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <FormControl fullWidth size="small">
              <InputLabel>Loại chi phí</InputLabel>
              <Select value={form.LoaiChiPhi} label="Loại chi phí" onChange={(e) => setForm((f) => ({ ...f, LoaiChiPhi: e.target.value }))}>
                {LOAI_CHI_PHI.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Số tiền (VNĐ)" type="number" fullWidth value={form.SoTien}
              onChange={(e) => setForm((f) => ({ ...f, SoTien: e.target.value }))} />
            <TextField size="small" label="Ghi chú" fullWidth value={form.GhiChu}
              onChange={(e) => setForm((f) => ({ ...f, GhiChu: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined">Hủy</Button>
          <Button onClick={handleAdd} variant="contained">Thêm</Button>
        </DialogActions>
      </Dialog>
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
          <Tab label="Thống kê chênh lệch" />
        </Tabs>
      </Card>
      <Box>
        {tab === 0 && <TabDuAn />}
        {tab === 1 && <TabBangLuong />}
        {tab === 2 && <TabChenhLech />}
      </Box>
    </Box>
  );
};

export default Statistics;
