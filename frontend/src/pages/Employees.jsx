import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, TextField, InputAdornment, Avatar, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, Select, FormControl, InputLabel, CircularProgress,
  Typography, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employees';
import { getDepartments } from '../api/departments';
import { getEducation, createEducation, updateEducation, deleteEducation } from '../api/education';
import { getContracts, createContract, updateContract, deleteContract } from '../api/contracts';
import { getInsurance, createInsurance, updateInsurance, deleteInsurance } from '../api/insurance';
import api from '../api/axios';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';
import useAuthStore from '../store/authStore';
import { formatDate, getInitials } from '../utils/format';
import { TRANG_THAI_NV, LOAI_HD, LOAI_BH } from '../constants';

// ── Inline mini form for sub-items ───────────────────────────────────────────
const SubForm = ({ fields, initial, onSave, onCancel }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  useEffect(() => { reset(initial || {}); }, [initial]);
  return (
    <Box component="form" onSubmit={handleSubmit(onSave)}
      sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2, mb: 1 }}>
      <Grid container spacing={1.5}>
        {fields.map(({ name, label, type, options }) => (
          <Grid item xs={12} sm={6} key={name}>
            <Controller name={name} control={control} render={({ field }) =>
              options ? (
                <FormControl fullWidth size="small">
                  <InputLabel>{label}</InputLabel>
                  <Select {...field} label={label}>
                    {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              ) : (
                <TextField {...field} fullWidth size="small" label={label} type={type || 'text'}
                  InputLabelProps={type === 'date' ? { shrink: true } : undefined} />
              )
            } />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button size="small" onClick={onCancel}>Hủy</Button>
        <Button size="small" variant="contained" type="submit">Lưu</Button>
      </Box>
    </Box>
  );
};

// ── Sub-list section ──────────────────────────────────────────────────────────
const SubSection = ({ title, items = [], fields, renderRow, pkField, onAdd, onUpdate, onDelete, readOnly = false }) => {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
        {!readOnly && (
          <Button size="small" startIcon={<AddIcon />} onClick={() => { setAdding(true); setEditId(null); }}>
            Thêm
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 1 }} />

      {!readOnly && adding && (
        <SubForm fields={fields} initial={{}}
          onCancel={() => setAdding(false)}
          onSave={(d) => { onAdd(d); setAdding(false); }} />
      )}

      {items.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 0.5, fontStyle: 'italic' }}>
          Chưa có dữ liệu
        </Typography>
      )}

      {items.map((item) => {
        const id = item[pkField];
        return !readOnly && editId === id ? (
          <SubForm key={id} fields={fields} initial={item}
            onCancel={() => setEditId(null)}
            onSave={(d) => { onUpdate(id, d); setEditId(null); }} />
        ) : (
          <Box key={id} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            py: 0.75, px: 1, borderRadius: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}>
            <Typography variant="body2">{renderRow(item)}</Typography>
            {!readOnly && (
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <Tooltip title="Sửa">
                  <IconButton size="small" onClick={() => { setEditId(id); setAdding(false); }}>
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton size="small" color="error" onClick={() => onDelete(id)}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

// ── Employee dialog (form + 3 sub-sections) ───────────────────────────────────
const EmployeeDialog = ({ open, onClose, onSave, initial, departments, positions, readOnly = false }) => {
  const toast = useToast();
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initial || {} });

  const [education, setEducation] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const maNV = initial?.MaNV1;

  useEffect(() => { reset(initial || {}); }, [initial]);

  useEffect(() => {
    if (!open || !maNV) { setEducation([]); setContracts([]); setInsurance([]); return; }
    getEducation({ MaNV1: maNV }).then((r) => setEducation(r.data.data ?? [])).catch(() => {});
    getContracts({ MaNV1: maNV }).then((r) => {
      const d = r.data.data; setContracts(d?.items ?? d ?? []);
    }).catch(() => {});
    getInsurance({ MaNV1: maNV }).then((r) => {
      const d = r.data.data; setInsurance(d?.items ?? d ?? []);
    }).catch(() => {});
  }, [open, maNV]);

  const reload = () => {
    if (!maNV) return;
    getEducation({ MaNV1: maNV }).then((r) => setEducation(r.data.data ?? [])).catch(() => {});
    getContracts({ MaNV1: maNV }).then((r) => {
      const d = r.data.data; setContracts(d?.items ?? d ?? []);
    }).catch(() => {});
    getInsurance({ MaNV1: maNV }).then((r) => {
      const d = r.data.data; setInsurance(d?.items ?? d ?? []);
    }).catch(() => {});
  };

  const wrap = async (fn, msg) => {
    try { await fn(); toast.success(msg); reload(); }
    catch { toast.error('Lỗi thao tác'); }
  };

  const confirmDelete = async (fn) => {
    const ok = await toast.confirm('Xóa mục này?', '');
    if (ok.isConfirmed) wrap(fn, 'Đã xóa');
  };

  const edFields = [
    { name: 'TenBangCap', label: 'Bằng cấp' },
    { name: 'ChuyenNganh', label: 'Chuyên ngành' },
    { name: 'NoiDaoTao', label: 'Nơi đào tạo' },
    { name: 'NamHoanThanh', label: 'Năm hoàn thành', type: 'number' },
  ];
  const ctFields = [
    { name: 'SoHD', label: 'Số hợp đồng' },
    { name: 'LoaiHD', label: 'Loại HĐ', options: LOAI_HD },
    { name: 'NgayKy', label: 'Ngày ký', type: 'date' },
    { name: 'NgayHH', label: 'Ngày hết hạn', type: 'date' },
  ];
  const insFields = [
    { name: 'MaBH', label: 'Mã BH' },
    { name: 'TenBH', label: 'Loại BH', options: LOAI_BH },
    { name: 'NgayHetHan', label: 'Ngày hết hạn', type: 'date' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle>{readOnly ? 'Thông tin nhân viên' : maNV ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent dividers>
          {/* ── Thông tin cơ bản ── */}
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Thông tin cơ bản</Typography>
          <Grid container spacing={2}>
            {[
              { name: 'MaNV1', label: 'Mã NV', required: true, disabled: !!maNV },
              { name: 'TenNV', label: 'Họ tên', required: true },
              { name: 'Email', label: 'Email' },
              { name: 'SDT', label: 'Số điện thoại' },
              { name: 'NgaySinh', label: 'Ngày sinh', type: 'date' },
              { name: 'DiaChi', label: 'Địa chỉ' },
              { name: 'SoCCCD', label: 'CCCD' },
              { name: 'SoTaiKhoanNN', label: 'Số TK ngân hàng' },
            ].map(({ name, label, required, disabled, type }) => (
              <Grid item xs={12} sm={6} key={name}>
                {readOnly ? (
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {type === 'date' ? formatDate(initial?.[name]) : (initial?.[name] || '—')}
                    </Typography>
                  </Box>
                ) : (
                  <Controller name={name} control={control}
                    rules={required ? { required: `${label} là bắt buộc` } : {}}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label={label} type={type || 'text'}
                        disabled={disabled} error={!!errors[name]} helperText={errors[name]?.message}
                        InputLabelProps={type === 'date' ? { shrink: true } : undefined} />
                    )} />
                )}
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              {readOnly ? (
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Phòng ban</Typography>
                  <Typography variant="body2" fontWeight={500}>{initial?.phongBan?.TenPB || initial?.MaPB || '—'}</Typography>
                </Box>
              ) : (
                <Controller name="MaPB" control={control} render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Phòng ban</InputLabel>
                    <Select {...field} label="Phòng ban">
                      {departments.map((d) => <MenuItem key={d.MaPB} value={d.MaPB}>{d.TenPB}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {readOnly ? (
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Chức vụ</Typography>
                  <Typography variant="body2" fontWeight={500}>{initial?.chucVu?.TenCV || initial?.MaCV || '—'}</Typography>
                </Box>
              ) : (
                <Controller name="MaCV" control={control} render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Chức vụ</InputLabel>
                    <Select {...field} label="Chức vụ">
                      {positions.map((p) => <MenuItem key={p.MaCV} value={p.MaCV}>{p.TenCV}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {readOnly ? (
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                  <Typography variant="body2" fontWeight={500}>{initial?.TrangThai || '—'}</Typography>
                </Box>
              ) : (
                <Controller name="TrangThai" control={control} render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Trạng thái</InputLabel>
                    <Select {...field} label="Trạng thái">
                      {TRANG_THAI_NV.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              )}
            </Grid>
          </Grid>

          {/* ── 3 sub-sections (chỉ hiện khi đang sửa NV đã có) ── */}
          {maNV && (
            <>
              <SubSection title="Trình độ học vấn" items={education} fields={edFields} pkField="MaTD" readOnly={readOnly}
                renderRow={(r) => `${r.TenBangCap} — ${r.ChuyenNganh} · ${r.NoiDaoTao} (${r.NamHoanThanh})`}
                onAdd={(d) => wrap(() => createEducation({ ...d, MaNV1: maNV }), 'Thêm thành công')}
                onUpdate={(id, d) => wrap(() => updateEducation(id, d), 'Cập nhật thành công')}
                onDelete={(id) => confirmDelete(() => deleteEducation(id))}
              />
              <SubSection title="Hợp đồng lao động" items={contracts} fields={ctFields} pkField="SoHD" readOnly={readOnly}
                renderRow={(r) => `${r.SoHD} · ${r.LoaiHD} · Ký: ${formatDate(r.NgayKy)} — HH: ${formatDate(r.NgayHH)}`}
                onAdd={(d) => wrap(() => createContract({ ...d, MaNV1: maNV }), 'Thêm thành công')}
                onUpdate={(id, d) => wrap(() => updateContract(id, d), 'Cập nhật thành công')}
                onDelete={(id) => confirmDelete(() => deleteContract(id))}
              />
              <SubSection title="Bảo hiểm" items={insurance} fields={insFields} pkField="MaBH" readOnly={readOnly}
                renderRow={(r) => `${r.MaBH} · ${r.TenBH} · HH: ${formatDate(r.NgayHetHan)}`}
                onAdd={(d) => wrap(() => createInsurance({ ...d, MaNV1: maNV }), 'Thêm thành công')}
                onUpdate={(id, d) => wrap(() => updateInsurance(id, d), 'Cập nhật thành công')}
                onDelete={(id) => confirmDelete(() => deleteInsurance(id))}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined">Đóng</Button>
          {!readOnly && <Button type="submit" variant="contained">Lưu thông tin</Button>}
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const Employees = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const canEdit = ['Admin', 'HR'].includes(user?.PhanQuyen);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterPB, setFilterPB] = useState('');
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const debouncedSearch = useDebounce(search);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees({ page: page + 1, limit: rowsPerPage, search: debouncedSearch, MaPB: filterPB });
      setData(res.data.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  }, [page, rowsPerPage, debouncedSearch, filterPB]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    getDepartments().then((r) => setDepartments(r.data.data || []));
    api.get('/positions').then((r) => setPositions(r.data.data || []));
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editItem) await updateEmployee(editItem.MaNV1, formData);
      else await createEmployee(formData);
      toast.success(editItem ? 'Cập nhật thành công' : 'Thêm thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const result = await toast.confirm('Xóa nhân viên?', 'Hành động này không thể hoàn tác.');
    if (result.isConfirmed) {
      try { await deleteEmployee(id); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader title="Quản lý nhân viên" subtitle={`${data.total} nhân viên`}
        action={canEdit && (
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setEditItem(null); setDialogOpen(true); }}>
            Thêm nhân viên
          </Button>
        )}
      />

      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField placeholder="Tìm kiếm..." size="small" sx={{ minWidth: 240 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Phòng ban</InputLabel>
            <Select value={filterPB} onChange={(e) => setFilterPB(e.target.value)} label="Phòng ban">
              <MenuItem value="">Tất cả</MenuItem>
              {departments.map((d) => <MenuItem key={d.MaPB} value={d.MaPB}>{d.TenPB}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Mã NV</TableCell>
                <TableCell>Phòng ban</TableCell>
                <TableCell>Chức vụ</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
              ) : data.items.length === 0 ? (
                <TableRow><TableCell colSpan={7}><EmptyState message="Không có nhân viên nào" /></TableCell></TableRow>
              ) : data.items.map((nv, i) => (
                <motion.tr key={nv.MaNV1} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }} style={{ display: 'table-row' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={nv.Avatar} sx={{ width: 36, height: 36, bgcolor: '#6366f1', fontSize: 13 }}>
                        {getInitials(nv.TenNV)}
                      </Avatar>
                      <Box>
                        <Box sx={{ fontWeight: 600, fontSize: 14 }}>{nv.TenNV}</Box>
                        <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{nv.SDT}</Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{nv.MaNV1}</TableCell>
                  <TableCell>{nv.phongBan?.TenPB || '—'}</TableCell>
                  <TableCell>{nv.chucVu?.TenCV || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{nv.Email}</TableCell>
                  <TableCell><StatusChip status={nv.TrangThai} /></TableCell>
                  <TableCell align="center">
                    {canEdit ? (
                      <>
                        <Tooltip title="Sửa / Chi tiết">
                          <IconButton size="small" onClick={() => { setEditItem(nv); setDialogOpen(true); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => handleDelete(nv.MaNV1)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Xem thông tin">
                        <IconButton size="small" onClick={() => { setEditItem(nv); setDialogOpen(true); }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={data.total} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Hàng/trang" />
      </Card>

      <EmployeeDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        onSave={handleSave} initial={editItem} readOnly={!canEdit}
        departments={departments} positions={positions} />
    </Box>
  );
};

export default Employees;
