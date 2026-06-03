import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton,
  TextField, Divider, Avatar, List, ListItem, ListItemAvatar, ListItemText,
  CircularProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import { getMyProjects, addNote, getNotes, getProject } from '../api/projects';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import ChatNotes from '../components/common/ChatNotes';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';
import { formatDate, getInitials } from '../utils/format';

// ── Dialog xem chi tiết + ghi chú ───────────────────────────────────────────
const ProjectNoteDialog = ({ open, onClose, projectId, onNoteAdded }) => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState([]);
  const [project, setProject] = useState(null);

  const reloadNotes = (id) => getNotes(id).then((r) => setNotes(r.data.data ?? [])).catch(() => {});
  const reloadProject = (id) => getProject(id).then((r) => setProject(r.data.data)).catch(() => {});

  useEffect(() => {
    if (!open || !projectId) { setNote(''); setProject(null); setNotes([]); return; }
    reloadProject(projectId);
    reloadNotes(projectId);
  }, [open, projectId]);

  if (!project) return null;

  const myMembership = project.nhanViens?.find((nv) => nv.MaNV1 === user?.MaNV1);
  const pc = myMembership?.PhanCong ?? myMembership?.phanCong ?? {};

  const handleSend = async () => {
    if (!note.trim()) return;
    setSending(true);
    try {
      await addNote(project.MaDOAN, { NoiDung: note });
      setNote('');
      reloadNotes(project.MaDOAN);
      onNoteAdded();
    } catch { toast.error('Lỗi gửi ghi chú'); }    finally { setSending(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle>
        <Typography fontWeight={700}>{project.TenDA}</Typography>
        <Typography variant="caption" color="text.secondary">
          <StatusChip status={project.TrangThai} size="small" sx={{ mr: 1 }} />
          {project.MaDOAN}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {/* Thông tin dự án */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{project.MoTa}</Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Thời gian</Typography>
              <Typography variant="body2" fontWeight={600}>{formatDate(project.NgayBD)} → {formatDate(project.NgayKT)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Vai trò của bạn</Typography>
              <Typography variant="body2" fontWeight={600}>{pc.VaiTro || '—'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Ngày tham gia</Typography>
              <Typography variant="body2" fontWeight={600}>{formatDate(pc.ThoiGianTG) || '—'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Thành viên</Typography>
              <Typography variant="body2" fontWeight={600}>{project.nhanViens?.length || 0} người</Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Tiến độ</Typography>
              <Typography variant="caption" fontWeight={700}>{project.TienDo ?? 0}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={project.TienDo ?? 0}
              sx={{ borderRadius: 4, height: 6 }} />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Thành viên dự án */}
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Thành viên ({project.nhanViens?.length || 0})
        </Typography>
        <List disablePadding sx={{ mb: 1 }}>
          {(project.nhanViens ?? []).map((nv) => {
            const nvPc = nv.PhanCong ?? nv.phanCong ?? {};
            return (
              <ListItem key={nv.MaNV1} disablePadding sx={{ py: 0.5 }}>
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 30, height: 30, bgcolor: nv.MaNV1 === user?.MaNV1 ? '#6366f1' : '#94a3b8', fontSize: 11 }}>
                    {getInitials(nv.TenNV)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={nv.MaNV1 === user?.MaNV1 ? 700 : 400}>
                      {nv.TenNV}{nv.MaNV1 === user?.MaNV1 ? ' (bạn)' : ''}
                    </Typography>
                  }
                  secondary={<Typography variant="caption" color="text.secondary">{nvPc.VaiTro || '—'}</Typography>}
                />
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mb: 2 }} />

        {/* Lịch sử ghi chú */}
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Lịch sử ghi chú</Typography>
        <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5, mb: 1.5 }}>
          <ChatNotes notes={notes} currentName={user?.TenNV} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Khung nhập báo cáo */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <TextField
            fullWidth multiline maxRows={4} rows={1}
            placeholder="Nhập nội dung báo cáo..."
            value={note} onChange={(e) => setNote(e.target.value)}
            size="small"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <IconButton color="primary" onClick={handleSend}
            disabled={!note.trim() || sending}
            sx={{ bgcolor: '#6366f1', color: '#fff', '&:hover': { bgcolor: '#4f46e5' }, '&:disabled': { bgcolor: 'action.disabledBackground' }, flexShrink: 0 }}>
            {sending ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon fontSize="small" />}
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMyProjects();
      setProjects(res.data.data ?? []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleNoteAdded = async () => { await fetchData(); };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <PageHeader title="Dự án của tôi" subtitle={`${projects.length} dự án đang tham gia`} />
      {projects.length === 0 ? <EmptyState message="Bạn chưa tham gia dự án nào" /> : (
        <Grid container spacing={3}>
          {projects.map((da, i) => {
            const pc = da.nhanViens?.[0]?.PhanCong ?? da.nhanViens?.[0]?.phanCong ?? {};
            return (
              <Grid item xs={12} md={6} lg={4} key={da.MaDOAN}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}
                    onClick={() => { setSelected(da.MaDOAN); setDialogOpen(true); }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <StatusChip status={da.TrangThai} />
                        <Chip label={pc.VaiTro || 'Thành viên'} size="small"
                          sx={{ bgcolor: '#6366f118', color: '#6366f1', fontWeight: 600 }} />
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>{da.TenDA}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 36 }}>
                        {da.MoTa}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Tiến độ</Typography>
                          <Typography variant="caption" fontWeight={700}>{da.TienDo ?? 0}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={da.TienDo ?? 0}
                          sx={{ borderRadius: 4, height: 6 }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Thời gian</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(da.NgayBD)} → {formatDate(da.NgayKT)}
                          </Typography>
                        </Box>
                        <Chip icon={<PeopleIcon />} label={`${da.nhanViens?.length || 0} thành viên`}
                          size="small" variant="outlined" />
                      </Box>
                      {da.ghiChus?.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {da.ghiChus.length} ghi chú đã gửi
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}
      <ProjectNoteDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        projectId={selected} onNoteAdded={handleNoteAdded} />
    </Box>
  );
};

export default MyProjects;
