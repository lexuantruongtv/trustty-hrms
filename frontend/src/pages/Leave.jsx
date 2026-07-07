import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, InputAdornment, Tooltip, Avatar, Typography, Chip,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useForm, Controller } from 'react-hook-form';
import { getLeaves, createLeave, approveLeave, rejectLeave, deleteLeave } from '../api/leave';
import { getDepartments } from '../api/departments';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';
import useAuthStore from '../store/authStore';
import { formatDate, getInitials } from '../utils/format';

const LeaveForm = ({ open, onClose, onSave }) => {
  const { control, handleSubmit, reset } = useForm();
  useEffect(() => { if (open) reset({}); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo đơn nghỉ phép</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Controller name="NgayBD" control={control} rules={{ required: true }}
            render={({ field }) => <TextField {...field} label="Ngày bắt đầu" type="date" fullWidth InputLabelProps={{ shrink: true }} />}
          />
          <Controller name="NgayKT" control={control} rules={{ required: true }}
            render={({ field }) => <TextField {...field} label="Ngày kết thúc" type="date" fullWidth InputLabelProps={{ shrink: true }} />}
          />
          <Controller name="LyDo" control={control} rules={{ required: true }}
            render={({ field }) => <TextField {...field} label="Lý do" fullWidth multiline rows={3} />}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined">Hủy</Button>
          <Button type="submit" variant="contained">Gửi đơn</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Leave = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [data, setData] = useState({ items: [], total: 0 });
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const canApprove = ['Admin', 'TruongPhong'].includes(user?.PhanQuyen);
  const isEmployee = !['Admin', 'Ketoan', 'TruongPhong', 'HR', 'Manager'].includes(user?.PhanQuyen);

  // Filter states
  const [search, setSearch] = useState('');
  const [filterPB, setFilterPB] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [filterNam, setFilterNam] = useState('');
  const debouncedSearch = useDebounce(search);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!isEmployee) {
      getDepartments()
        .then((r) => {
          const list = r.data.data?.items || r.data.data || r.data || [];
          setDepartments(Array.isArray(list) ? list : []);
        })
        .catch(() => {});
    }
  }, [isEmployee]);

  const fetchData = useCallback(async () => {
    try {
      const params = { page: page + 1, limit: 10 };
      if (isEmployee) params.MaNV1 = user.MaNV1;
      if (debouncedSearch && !isEmployee) params.tenNV = debouncedSearch;
      if (filterPB) params.MaPB = filterPB;
      if (filterTrangThai) params.TrangThai = filterTrangThai;
      if (filterNam) params.nam = filterNam;
      const res = await getLeaves(params);
      setData(res.data.data);
    } catch { }
  }, [page, user, isEmployee, debouncedSearch, filterPB, filterTrangThai, filterNam]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (formData) => {
    try {
      await createLeave(formData);
      toast.success('Gửi đơn thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleApprove = async (id) => {
    try { await approveLeave(id); toast.success('Đã duyệt'); fetchData(); }
    catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleReject = async (id) => {
    try { await rejectLeave(id); toast.warning('Đã từ chối'); fetchData(); }
    catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa đơn?', '');
    if (r.isConfirmed) {
      try { await deleteLeave(id); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader title="Nghỉ phép" subtitle={`${data.total} đơn`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Tạo đơn</Button>}
      />

      {/* Filter section */}
      {!isEmployee && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Tìm kiếm nhân viên..."
              size="small"
              sx={{ minWidth: 240 }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Phòng ban</InputLabel>
              <Select value={filterPB} label="Phòng ban" onChange={(e) => { setFilterPB(e.target.value); setPage(0); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {departments.map((d) => <MenuItem key={d.MaPB} value={d.MaPB}>{d.TenPB}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select value={filterTrangThai} label="Trạng thái" onChange={(e) => { setFilterTrangThai(e.target.value); setPage(0); }}>
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Chờ duyệt">Chờ duyệt</MenuItem>
                <MenuItem value="Đã duyệt">Đã duyệt</MenuItem>
                <MenuItem value="Từ chối">Từ chối</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Năm</InputLabel>
              <Select value={filterNam} label="Năm" onChange={(e) => { setFilterNam(e.target.value); setPage(0); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Card>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Từ ngày</TableCell>
                <TableCell>Đến ngày</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState message="Không có đơn nghỉ phép" /></TableCell></TableRow>
              ) : data.items.map((np) => (
                <TableRow key={np.MaDon} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#ec4899', fontSize: 12 }}>
                        {getInitials(np.nhanVien?.TenNV)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{np.nhanVien?.TenNV}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[np.nhanVien?.chucVu?.TenCV, np.nhanVien?.phongBan?.TenPB].filter(Boolean).join(' · ')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(np.NgayBD)}</TableCell>
                  <TableCell>{formatDate(np.NgayKT)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{np.LyDo}</Typography>
                  </TableCell>
                  <TableCell><StatusChip status={np.TrangThai} /></TableCell>
                  <TableCell align="center">
                    {canApprove && np.TrangThai === 'Chờ duyệt' && (
                      <>
                        <Tooltip title="Duyệt">
                          <IconButton size="small" color="success" onClick={() => handleApprove(np.MaDon)}><CheckIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Từ chối">
                          <IconButton size="small" color="warning" onClick={() => handleReject(np.MaDon)}><CloseIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </>
                    )}
                    {(user?.PhanQuyen !== 'Ketoan' || np.nhanVien?.MaNV1 === user?.MaNV1 || np.MaNV1 === user?.MaNV1) && (
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error" onClick={() => handleDelete(np.MaDon)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={data.total} page={page} rowsPerPage={10}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} labelRowsPerPage="Hàng/trang" />
      </Card>
      <LeaveForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleCreate} />
    </Box>
  );
};

export default Leave;
