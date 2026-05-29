import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Tooltip, Avatar, Typography, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { getLeaves, createLeave, approveLeave, rejectLeave, deleteLeave } from '../api/leave';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
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
  const canApprove = ['Admin', 'HR', 'Manager'].includes(user?.PhanQuyen);

  const fetchData = useCallback(async () => {
    try {
      const params = { page: page + 1, limit: 10 };
      if (user?.PhanQuyen === 'Employee') params.MaNV1 = user.MaNV1;
      const res = await getLeaves(params);
      setData(res.data.data);
    } catch { }
  }, [page, user]);

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
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#ec4899', fontSize: 12 }}>
                        {getInitials(np.nhanVien?.TenNV)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{np.nhanVien?.TenNV}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(np.NgayBD)}</TableCell>
                  <TableCell>{formatDate(np.NgayKT)}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap>{np.LyDo}</Typography>
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
                    <Tooltip title="Xóa">
                      <IconButton size="small" color="error" onClick={() => handleDelete(np.MaDon)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
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
