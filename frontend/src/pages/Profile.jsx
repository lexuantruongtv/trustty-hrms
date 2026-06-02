import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Avatar, Chip, Divider,
  List, ListItem,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { motion } from 'framer-motion';
import { getMe } from '../api/auth';
import PageHeader from '../components/common/PageHeader';
import LoadingScreen from '../components/common/LoadingScreen';
import { formatDate, getInitials } from '../utils/format';

const InfoRow = ({ icon, label, value }) => (
  <ListItem disablePadding sx={{ py: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
      <Box sx={{ color: '#6366f1', display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
      </Box>
    </Box>
  </ListItem>
);

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((r) => setProfile(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (!profile) return null;

  const roleColors = { Admin: '#6366f1', HR: '#ec4899', Manager: '#f59e0b', Employee: '#10b981' };
  const roleColor = roleColors[profile.taiKhoan?.PhanQuyen] || '#6366f1';

  return (
    <Box>
      <PageHeader title="Hồ sơ cá nhân" />
      <Grid container spacing={3}>
        {/* Avatar card */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar
                  src={profile.Avatar}
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: roleColor, fontSize: 36, fontWeight: 700 }}
                >
                  {getInitials(profile.TenNV)}
                </Avatar>
                <Typography variant="h6" fontWeight={700}>{profile.TenNV}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{profile.chucVu?.TenCV}</Typography>
                <Chip label={profile.taiKhoan?.PhanQuyen} sx={{ bgcolor: `${roleColor}18`, color: roleColor, fontWeight: 700 }} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">{profile.phongBan?.TenPB}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{profile.MaNV1}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Info card */}
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Thông tin cá nhân</Typography>
                <List disablePadding>
                  <InfoRow icon={<PersonIcon />} label="Họ và tên" value={profile.TenNV} />
                  <InfoRow icon={<EmailIcon />} label="Email" value={profile.Email} />
                  <InfoRow icon={<PhoneIcon />} label="Số điện thoại" value={profile.SDT} />
                  <InfoRow icon={<LocationOnIcon />} label="Địa chỉ" value={profile.DiaChi} />
                  <InfoRow icon={<BadgeIcon />} label="CCCD" value={profile.SoCCCD} />
                  <InfoRow icon={<PersonIcon />} label="Ngày sinh" value={formatDate(profile.NgaySinh)} />
                  <InfoRow icon={<BadgeIcon />} label="Số TK ngân hàng" value={profile.SoTaiKhoanNN} />
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Trình độ */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SchoolIcon sx={{ color: '#6366f1' }} />
                  <Typography variant="h6" fontWeight={700}>Trình độ học vấn</Typography>
                </Box>
                {(profile.trinhDos ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">Chưa có dữ liệu</Typography>
                ) : (profile.trinhDos ?? []).map((td) => (
                  <Box key={td.MaTD} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { mb: 0, pb: 0, border: 'none' } }}>
                    <Typography variant="body2" fontWeight={600}>{td.TenBangCap} — {td.ChuyenNganh}</Typography>
                    <Typography variant="caption" color="text.secondary">{td.NoiDaoTao} · {td.NamHoanThanh}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Hợp đồng */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DescriptionIcon sx={{ color: '#f59e0b' }} />
                  <Typography variant="h6" fontWeight={700}>Hợp đồng lao động</Typography>
                </Box>
                {(profile.hopDongs ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">Chưa có dữ liệu</Typography>
                ) : (profile.hopDongs ?? []).map((hd) => (
                  <Box key={hd.SoHD} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { mb: 0, pb: 0, border: 'none' } }}>
                    <Typography variant="body2" fontWeight={600}>{hd.SoHD} · {hd.LoaiHD}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ký: {formatDate(hd.NgayKy)} — HH: {formatDate(hd.NgayHH)}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Bảo hiểm */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HealthAndSafetyIcon sx={{ color: '#10b981' }} />
                  <Typography variant="h6" fontWeight={700}>Bảo hiểm</Typography>
                </Box>
                {(profile.baoHiems ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">Chưa có dữ liệu</Typography>
                ) : (profile.baoHiems ?? []).map((bh) => (
                  <Box key={bh.MaBH} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { mb: 0, pb: 0, border: 'none' } }}>
                    <Typography variant="body2" fontWeight={600}>{bh.MaBH} · {bh.TenBH}</Typography>
                    <Typography variant="caption" color="text.secondary">HH: {formatDate(bh.NgayHetHan)}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
