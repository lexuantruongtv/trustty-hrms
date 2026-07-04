import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, List, ListItem, ListItemText, ListItemIcon, Typography, Divider,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Autocomplete, Avatar, Stack, ToggleButton, ToggleButtonGroup, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton, Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SendIcon from '@mui/icons-material/Send';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import { getNotifications, markAllRead, sendNotification, getAdminNotifications, deleteNotificationGroup, getDetailNotification, updateNotificationGroup } from '../api/notifications';
import { getEmployees } from '../api/employees';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';
import { getInitials } from '../utils/format';

const SendDialog = ({ open, onClose, onSent }) => {
  const toast = useToast();
  const [mode, setMode] = useState('all'); // 'all' | 'select'
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState([]);
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) getEmployees({ limit: 200 }).then((r) => setEmployees(r.data.data?.items || [])).catch(() => {});
  }, [open]);

  const handleReset = () => { setMode('all'); setSelected([]); setTieuDe(''); setNoiDung(''); };

  const handleSend = async () => {
    if (!tieuDe.trim() || !noiDung.trim()) return toast.error('Vui lòng nhập tiêu đề và nội dung');
    if (mode === 'select' && selected.length === 0) return toast.error('Chọn ít nhất 1 người nhận');
    setLoading(true);
    try {
      await sendNotification({
        TieuDe: tieuDe,
        NoiDung: noiDung,
        MaNV1List: mode === 'all' ? [] : selected.map((e) => e.MaNV1),
      });
      const count = mode === 'all' ? employees.length : selected.length;
      toast.success(`Đã gửi thông báo đến ${count} người`);
      handleReset();
      onClose();
      onSent();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi gửi thông báo'); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gửi thông báo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="body2" fontWeight={600} mb={1}>Người nhận</Typography>
            <ToggleButtonGroup value={mode} exclusive onChange={(_, v) => v && setMode(v)} size="small" fullWidth>
              <ToggleButton value="all"><PeopleIcon sx={{ mr: 1, fontSize: 18 }} />Tất cả nhân viên</ToggleButton>
              <ToggleButton value="select"><PersonIcon sx={{ mr: 1, fontSize: 18 }} />Chọn người nhận</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {mode === 'select' && (
            <Autocomplete
              multiple
              options={employees}
              getOptionLabel={(e) => e.TenNV}
              value={selected}
              onChange={(_, v) => setSelected(v)}
              renderOption={(props, e) => (
                <Box component="li" {...props} sx={{ gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#6366f1', fontSize: 11 }}>{getInitials(e.TenNV)}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{e.TenNV}</Typography>
                    <Typography variant="caption" color="text.secondary">{e.MaNV1}</Typography>
                  </Box>
                </Box>
              )}
              renderTags={(value, getTagProps) =>
                value.map((e, i) => <Chip key={e.MaNV1} label={e.TenNV} size="small" {...getTagProps({ index: i })} />)
              }
              renderInput={(params) => <TextField {...params} label="Tìm và chọn nhân viên" size="small" />}
            />
          )}

          <TextField
            label="Tiêu đề"
            fullWidth
            size="small"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value)}
          />
          <TextField
            label="Nội dung"
            fullWidth
            multiline
            rows={4}
            size="small"
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={() => { handleReset(); onClose(); }} variant="outlined">Hủy</Button>
        <Button onClick={handleSend} variant="contained" startIcon={<SendIcon />} disabled={loading}>
          Gửi{mode === 'select' && selected.length > 0 ? ` (${selected.length})` : mode === 'all' ? ' tất cả' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DetailDialog = ({ open, onClose, group, onSaved }) => {
  const toast = useToast();
  const [detail, setDetail] = useState([]);
  const [editing, setEditing] = useState(false);
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !group) return;
    setTieuDe(group.TieuDe);
    setNoiDung(group.NoiDung);
    setEditing(false);
    getDetailNotification({ TieuDe: group.TieuDe, NoiDung: group.NoiDung })
      .then((r) => setDetail(r.data.data || []))
      .catch(() => {});
  }, [open, group]);

  const handleSave = async () => {
    if (!tieuDe.trim() || !noiDung.trim()) return toast.error('Tiêu đề và nội dung không được trống');
    setLoading(true);
    try {
      await updateNotificationGroup({ TieuDeOld: group.TieuDe, NoiDungOld: group.NoiDung, TieuDeNew: tieuDe, NoiDungNew: noiDung });
      toast.success('Đã cập nhật thông báo');
      setEditing(false);
      onSaved();
      onClose();
    } catch { toast.error('Lỗi cập nhật'); }
    finally { setLoading(false); }
  };

  if (!group) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography fontWeight={700}>Chi tiết thông báo</Typography>
        {!editing && (
          <Button size="small" startIcon={<EditIcon />} onClick={() => setEditing(true)}>Chỉnh sửa</Button>
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {editing ? (
            <>
              <TextField label="Tiêu đề" fullWidth size="small" value={tieuDe} onChange={(e) => setTieuDe(e.target.value)} />
              <TextField label="Nội dung" fullWidth multiline rows={3} size="small" value={noiDung} onChange={(e) => setNoiDung(e.target.value)} />
            </>
          ) : (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography fontWeight={700} mb={0.5}>{group.TieuDe}</Typography>
              <Typography variant="body2" color="text.secondary">{group.NoiDung}</Typography>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Danh sách người nhận ({detail.length})
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                    <TableCell>Nhân viên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detail.map((r) => (
                    <TableRow key={r.MaTB} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{r.nhanVien?.TenNV || r.MaNV1}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{r.nhanVien?.Email || '—'}</TableCell>
                      <TableCell align="center">
                        <Chip label={r.DaDoc ? 'Đã đọc' : 'Chưa đọc'} size="small"
                          color={r.DaDoc ? 'success' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={() => { setEditing(false); onClose(); }} variant="outlined">Đóng</Button>
        {editing && (
          <Button onClick={handleSave} variant="contained" disabled={loading}>Lưu thay đổi</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const Notifications = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [adminItems, setAdminItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState(null);
  const [tab, setTab] = useState(0);
  const isAdmin = user?.PhanQuyen === 'Admin';

  const fetchData = useCallback(() => getNotifications().then((r) => setItems(r.data.data || [])).catch(() => {}), []);
  const fetchAdmin = useCallback(() => {
    if (isAdmin) getAdminNotifications().then((r) => setAdminItems(r.data.data || [])).catch(() => {});
  }, [isAdmin]);

  useEffect(() => { fetchData(); fetchAdmin(); }, [fetchData, fetchAdmin]);

  const handleMarkAll = async () => {
    await markAllRead();
    toast.success('Đã đánh dấu đọc tất cả');
    fetchData();
  };

  const handleDelete = async (TieuDe, NoiDung) => {
    const r = await toast.confirm(`Xóa thông báo "${TieuDe}" khỏi tất cả người nhận?`, '');
    if (!r.isConfirmed) return;
    try {
      await deleteNotificationGroup({ TieuDe, NoiDung });
      toast.success('Đã xóa');
      fetchAdmin();
    } catch { toast.error('Lỗi'); }
  };

  const unread = items.filter((n) => !n.DaDoc).length;

  return (
    <Box>
      <PageHeader
        title="Thông báo"
        subtitle={unread > 0 ? `${unread} chưa đọc` : 'Tất cả đã đọc'}
        action={
          <Stack direction="row" spacing={1}>
            {tab === 0 && unread > 0 && <Button variant="outlined" onClick={handleMarkAll}>Đánh dấu đọc tất cả</Button>}
            {isAdmin && (
              <Button variant="contained" startIcon={<SendIcon />} onClick={() => setDialogOpen(true)}>
                Gửi thông báo
              </Button>
            )}
          </Stack>
        }
      />

      {isAdmin && (
        <Card sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
            <Tab label="Thông báo của tôi" />
            <Tab label={`Quản lý thông báo đã gửi (${adminItems.length})`} />
          </Tabs>
        </Card>
      )}

      {tab === 0 && (
        <Card>
          {items.length === 0 ? <EmptyState message="Không có thông báo nào" /> : (
            <List disablePadding>
              {items.map((n, i) => (
                <motion.div key={n.MaTB} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <ListItem sx={{
                    px: 3, py: 2,
                    bgcolor: n.DaDoc ? 'transparent' : 'action.hover',
                    borderLeft: n.DaDoc ? 'none' : '3px solid #6366f1',
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <NotificationsIcon sx={{ color: n.DaDoc ? 'text.disabled' : '#6366f1' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={n.DaDoc ? 400 : 700}>{n.TieuDe}</Typography>
                          {!n.DaDoc && <Chip label="Mới" size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">{n.NoiDung}</Typography>
                          <Typography variant="caption" color="text.disabled">
                            {new Date(n.NgayTao).toLocaleString('vi-VN')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {i < items.length - 1 && <Divider />}
                </motion.div>
              ))}
            </List>
          )}
        </Card>
      )}

      {tab === 1 && isAdmin && (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell align="center">Người nhận</TableCell>
                  <TableCell align="center">Đã đọc</TableCell>
                  <TableCell>Thời gian gửi</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminItems.length === 0
                  ? <TableRow><TableCell colSpan={6}><EmptyState message="Chưa có thông báo nào được gửi" /></TableCell></TableRow>
                  : adminItems.map((n, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 600, maxWidth: 200 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{n.TieuDe}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>{n.NoiDung}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={n.SoNguoiNhan} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color={n.DaDocCount > 0 ? 'success.main' : 'text.disabled'}>
                          {n.DaDocCount}/{n.SoNguoiNhan}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="caption">{new Date(n.NgayTao).toLocaleString('vi-VN')}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Xem chi tiết / Sửa">
                          <IconButton size="small" color="primary" onClick={() => setDetailGroup(n)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa khỏi tất cả người nhận">
                          <IconButton size="small" color="error" onClick={() => handleDelete(n.TieuDe, n.NoiDung)}>
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
      )}

      <SendDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSent={() => { fetchData(); fetchAdmin(); }} />
      <DetailDialog open={!!detailGroup} onClose={() => setDetailGroup(null)} group={detailGroup} onSaved={fetchAdmin} />
    </Box>
  );
};

export default Notifications;
