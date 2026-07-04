import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, IconButton, Tooltip, Typography, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Grid, MenuItem, Select, FormControl, InputLabel, CircularProgress, Divider, Stack,
} from '@mui/material';
import SearchableEmployeeSelect from '../components/common/SearchableEmployeeSelect';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import { useForm, Controller } from 'react-hook-form';
import { getSalaryChanges, createSalaryChange, deleteSalaryChange } from '../api/salaryChanges';
import { getEmployees } from '../api/employees';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';
import { formatDate, formatCurrency, getInitials } from '../utils/format';

const HINH_THUC = ['Tăng lương', 'Giảm lương', 'Thưởng', 'Phụ cấp', 'Điều chỉnh khác'];

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `ngày ${dt.getDate()} tháng ${dt.getMonth() + 1} năm ${dt.getFullYear()}`;
};

// Phân loại hình thức → loại văn bản
const getDocType = (hinhThuc) => {
  if (!hinhThuc) return null;
  if (['Thưởng', 'Tăng lương', 'Phụ cấp'].includes(hinhThuc)) return 'khen_thuong';
  if (['Giảm lương', 'Điều chỉnh khác'].includes(hinhThuc)) return 'xu_phat';
  return null;
};

// Sinh HTML văn bản in
const buildDocHTML = (bd, docType) => {
  const nv    = bd.nhanVien;
  const tenNV = nv?.TenNV || '';
  const chucVu= nv?.chucVu?.TenCV || '';
  const phong = nv?.phongBan?.TenPB || '';
  const ngay  = fmtDate(bd.NgayQuyetDinh);
  const soTien= fmt(Math.abs(bd.GiaTien)) + ' đồng';
  const noiDung = bd.NoiDung || '';

  const style = `
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 13pt; margin: 40px; color: #000; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .title { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 18px 0 6px; }
      .subtitle { font-size: 12pt; font-style: italic; margin-bottom: 20px; }
      .body { margin: 16px 0; line-height: 1.9; }
      .sign { display: flex; justify-content: space-between; margin-top: 40px; }
      .sign-block { text-align: center; width: 45%; }
      .sign-line { border-top: 1px solid #000; margin-top: 60px; }
      hr { border: none; border-top: 1px solid #000; margin: 10px 0; }
      .header-row { display: flex; justify-content: space-between; }
      .label { font-weight: bold; }
    </style>`;

  if (docType === 'khen_thuong') {
    const soQD = `${String(bd.MaBD).padStart(3, '0')}/QĐ-KT`;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">${style}</head><body>
      <div class="header-row">
        <div class="center"><div class="bold">CÔNG TY PHẦN MỀM TRUSTTY</div><div>Số: ${soQD}</div></div>
        <div class="center"><div class="bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div><div>Độc lập – Tự do – Hạnh phúc</div><hr><div style="font-style:italic">Hà Nội, ${ngay}</div></div>
      </div>
      <div class="center">
        <div class="title">Quyết định</div>
        <div class="subtitle">Về việc ${bd.HinhThuc?.toLowerCase()} cho nhân viên</div>
      </div>
      <div class="body">
        <div class="bold center">GIÁM ĐỐC CÔNG TY PHẦN MỀM TRUSTTY</div>
        <p>Căn cứ Bộ luật Lao động số 45/2019/QH14 ngày 20/11/2019;</p>
        <p>Căn cứ Quy chế lương thưởng của Công ty Phần mềm TrustTY;</p>
        <p>Căn cứ đề nghị của Phòng Nhân Sự về việc khen thưởng nhân viên có thành tích xuất sắc;</p>
        <p><span class="bold">QUYẾT ĐỊNH:</span></p>
        <p><span class="bold">Điều 1.</span> ${bd.HinhThuc} cho Ông/Bà <span class="bold">${tenNV}</span>, chức vụ <span class="bold">${chucVu}</span>, công tác tại <span class="bold">${phong}</span>.</p>
        <p>Lý do: ${noiDung}.</p>
        <p>Hình thức: <span class="bold">${bd.HinhThuc}</span> với giá trị <span class="bold">${soTien}</span>.</p>
        <p>Thời gian áp dụng: kể từ ${ngay}.</p>
        <p><span class="bold">Điều 2.</span> Phòng Kế Toán có trách nhiệm chi trả khoản ${bd.HinhThuc?.toLowerCase()} nêu trên theo đúng quy định.</p>
        <p><span class="bold">Điều 3.</span> Phòng Nhân Sự, Phòng Kế Toán và Ông/Bà <span class="bold">${tenNV}</span> chịu trách nhiệm thi hành Quyết định này.</p>
      </div>
      <div class="sign">
        <div class="sign-block"><div>Người nhận</div><div style="font-style:italic;font-size:11pt">(Ký, ghi rõ họ tên)</div></br><div class="sign-line"></div></div>
        <div class="sign-block"><div>TM. BAN GIÁM ĐỐC</div><div class="bold">GIÁM ĐỐC</div><div style="font-style:italic;font-size:11pt">(Ký, đóng dấu)</div><div class="sign-line"> </div></div>
      </div>
    </body></html>`;
  }

  // xu_phat — Biên bản xử lý vi phạm
  const soBB = `${String(bd.MaBD).padStart(3, '0')}/BB-XL`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${style}</head><body>
    <div class="header-row">
      <div class="center"><div class="bold">CÔNG TY PHẦN MỀM TRUSTTY</div><div>Số: ${soBB}</div></div>
      <div class="center"><div class="bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div><div>Độc lập – Tự do – Hạnh phúc</div><hr><div style="font-style:italic">Hà Nội, ${ngay}</div></div>
    </div>
    <div class="center">
      <div class="title">Biên bản xử lý vi phạm kỷ luật lao động</div>
    </div>
    <div class="body">
      <p>Hôm nay, ${ngay}, tại Công ty Phần mềm TrustTY, chúng tôi gồm:</p>
      <p><span class="bold">Bên lập biên bản:</span> Đại diện Ban Giám Đốc và Phòng Nhân Sự Công ty Phần mềm TrustTY.</p>
      <p><span class="bold">Người vi phạm:</span> Ông/Bà <span class="bold">${tenNV}</span>, chức vụ <span class="bold">${chucVu}</span>, công tác tại <span class="bold">${phong}</span>.</p>
      <p><span class="bold">Nội dung vi phạm:</span> ${noiDung}.</p>
      <p><span class="bold">Căn cứ xử lý:</span></p>
      <p style="padding-left:24px">– Bộ luật Lao động số 45/2019/QH14 ngày 20/11/2019, Điều 127 về xử lý kỷ luật lao động;</p>
      <p style="padding-left:24px">– Nội quy lao động và Quy chế lương thưởng của Công ty Phần mềm TrustTY.</p>
      <p><span class="bold">Hình thức xử lý:</span> ${bd.HinhThuc} với mức <span class="bold">${soTien}</span>.</p>
      <p><span class="bold">Ý kiến của người vi phạm:</span> .......................................................................................................</p>
      <p>Biên bản được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
    </div>
    <div class="sign">
      <div class="sign-block"><div>Người vi phạm</div><div style="font-style:italic;font-size:11pt">(Ký, ghi rõ họ tên)</div></br><div class="sign-line"></div></div>
      <div class="sign-block"><div>TM. BAN GIÁM ĐỐC</div><div class="bold">GIÁM ĐỐC</div><div style="font-style:italic;font-size:11pt">(Ký, đóng dấu)</div><div class="sign-line"> </div></div>
    </div>
  </body></html>`;
};

// ─── Form thêm biến động ───────────────────────────────────────────────────
const SalaryChangeForm = ({ open, onClose, onSave, employees }) => {
  const { control, handleSubmit, reset } = useForm();
  useEffect(() => { if (open) reset({}); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thêm biến động lương</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Controller name="MaNV1" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <SearchableEmployeeSelect value={field.value ?? ''} onChange={field.onChange} employees={employees} />
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="HinhThuc" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Hình thức</InputLabel>
                    <Select {...field} label="Hình thức">
                      {HINH_THUC.map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="NgayQuyetDinh" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label="Ngày quyết định" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="NoiDung" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label="Nội dung" fullWidth multiline rows={2} />
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="GiaTien" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label="Giá trị (VNĐ, âm = giảm)" type="number" fullWidth
                    helperText="Dương: tăng/thưởng — Âm: giảm/phạt" />
                )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined">Hủy</Button>
          <Button type="submit" variant="contained">Lưu</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ─── Dialog xem chi tiết ──────────────────────────────────────────────────
const DetailDialog = ({ open, onClose, bd, canPrint }) => {
  if (!bd) return null;
  const docType = getDocType(bd.HinhThuc);
  const isPositive = +bd.GiaTien >= 0;

  const handlePrint = () => {
    const html = buildDocHTML(bd, docType);
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography fontWeight={700}>Chi tiết biến động lương</Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#0ea5e9', width: 44, height: 44, fontSize: 14 }}>
              {getInitials(bd.nhanVien?.TenNV)}
            </Avatar>
            <Box>
              <Typography fontWeight={700}>{bd.nhanVien?.TenNV}</Typography>
              <Typography variant="caption" color="text.secondary">
                {[bd.nhanVien?.chucVu?.TenCV, bd.nhanVien?.phongBan?.TenPB].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
          </Box>
          <Divider />
          {[
            { label: 'Hình thức', value: bd.HinhThuc },
            { label: 'Nội dung', value: bd.NoiDung },
            { label: 'Ngày quyết định', value: formatDate(bd.NgayQuyetDinh) },
            {
              label: 'Giá trị',
              value: (
                <Typography fontWeight={700} color={isPositive ? 'success.main' : 'error.main'}>
                  {isPositive ? '+' : ''}{formatCurrency(bd.GiaTien)}
                </Typography>
              ),
            },
          ].map(({ label, value }) => (
            <Box key={label} sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>{label}:</Typography>
              {typeof value === 'string'
                ? <Typography variant="body2" fontWeight={500}>{value}</Typography>
                : value}
            </Box>
          ))}
          {canPrint && docType && (
            <Box sx={{ mt: 1, p: 1.5, borderRadius: 1, bgcolor: docType === 'khen_thuong' ? '#f0fdf4' : '#fef2f2', border: '1px solid', borderColor: docType === 'khen_thuong' ? '#bbf7d0' : '#fecaca' }}>
              <Typography variant="caption" color={docType === 'khen_thuong' ? 'success.main' : 'error.main'} fontWeight={600}>
                {docType === 'khen_thuong'
                  ? '📄 Có thể in Quyết định khen thưởng theo Bộ luật Lao động 2019'
                  : '📄 Có thể in Biên bản xử lý vi phạm kỷ luật lao động (Điều 127, BLLĐ 2019)'}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Đóng</Button>
        {canPrint && docType && (
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}
            color={docType === 'khen_thuong' ? 'success' : 'error'}>
            {docType === 'khen_thuong' ? 'In Quyết định' : 'In Biên bản'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────
const SalaryChanges = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [employees, setEmployees] = useState([]);

  const canManage = user?.PhanQuyen === 'Admin';
  const canPrint  = user?.PhanQuyen === 'Admin';
  const canViewAll = ['Admin', 'Ketoan'].includes(user?.PhanQuyen);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: 10 };
      if (!canViewAll) params.MaNV1 = user.MaNV1;
      const res = await getSalaryChanges(params);
      setData(res.data.data);
    } catch { }
    finally { setLoading(false); }
  }, [page, user, canViewAll]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (canManage) getEmployees({ limit: 200 }).then((r) => setEmployees(r.data.data?.items || []));
  }, [canManage]);

  const handleSave = async (formData) => {
    try {
      await createSalaryChange(formData);
      toast.success('Thêm thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa biến động lương này?', '');
    if (r.isConfirmed) {
      try { await deleteSalaryChange(id); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader title="Biến động lương" subtitle={`${data.total} bản ghi`}
        action={canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Thêm
          </Button>
        )}
      />
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Hình thức</TableCell>
                <TableCell>Nội dung</TableCell>
                <TableCell align="right">Giá trị</TableCell>
                <TableCell>Ngày quyết định</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
              ) : data.items.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState message="Chưa có biến động lương" /></TableCell></TableRow>
              ) : data.items.map((bd) => (
                <TableRow key={bd.MaBD} hover>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#0ea5e9', fontSize: 12 }}>
                        {getInitials(bd.nhanVien?.TenNV)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{bd.nhanVien?.TenNV}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[bd.nhanVien?.chucVu?.TenCV, bd.nhanVien?.phongBan?.TenPB].filter(Boolean).join(' · ')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{
                      px: 1, py: 0.25, borderRadius: 1, display: 'inline-block', fontSize: 12,
                      bgcolor: +bd.GiaTien >= 0 ? '#dcfce7' : '#fee2e2',
                      color: +bd.GiaTien >= 0 ? '#16a34a' : '#dc2626',
                    }}>
                      {bd.HinhThuc}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap>{bd.NoiDung}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}
                      sx={{ color: +bd.GiaTien >= 0 ? 'success.main' : 'error.main' }}>
                      {+bd.GiaTien >= 0 ? '+' : ''}{formatCurrency(bd.GiaTien)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(bd.NgayQuyetDinh)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={0.5}>
                      <Tooltip title="Xem chi tiết & in văn bản">
                        <IconButton size="small" color="primary" onClick={() => setDetailRow(bd)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canPrint && getDocType(bd.HinhThuc) && (
                        <Tooltip title={getDocType(bd.HinhThuc) === 'khen_thuong' ? 'In Quyết định khen thưởng' : 'In Biên bản xử lý'}>
                          <IconButton size="small"
                            color={getDocType(bd.HinhThuc) === 'khen_thuong' ? 'success' : 'error'}
                            onClick={() => {
                              const w = window.open('', '_blank', 'width=900,height=700');
                              w.document.write(buildDocHTML(bd, getDocType(bd.HinhThuc)));
                              w.document.close();
                              w.focus();
                              setTimeout(() => w.print(), 400);
                            }}>
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canManage && (
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => handleDelete(bd.MaBD)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={data.total} page={page} rowsPerPage={10}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} labelRowsPerPage="Hàng/trang" />
      </Card>

      <SalaryChangeForm open={dialogOpen} onClose={() => setDialogOpen(false)}
        onSave={handleSave} employees={employees} />

      <DetailDialog open={!!detailRow} onClose={() => setDetailRow(null)} bd={detailRow} canPrint={canPrint} />
    </Box>
  );
};

export default SalaryChanges;
