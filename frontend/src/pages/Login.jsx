import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import useAuthStore from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ TenTaiKhoan: '', MatKhau: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      const { token, user } = res.data.data;
      setAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 2,
    }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card sx={{ width: 420, borderRadius: 4, overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', p: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <LockIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="white">TrustTY HRMS</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Hệ thống quản lý nhân sự
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth label="Tên tài khoản" variant="outlined" sx={{ mb: 2 }}
                value={form.TenTaiKhoan}
                onChange={(e) => setForm({ ...form, TenTaiKhoan: e.target.value })}
                autoFocus
              />
              <TextField
                fullWidth label="Mật khẩu" variant="outlined" sx={{ mb: 3 }}
                type={showPass ? 'text' : 'password'}
                value={form.MatKhau}
                onChange={(e) => setForm({ ...form, MatKhau: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                        {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit" fullWidth variant="contained" size="large" disabled={loading}
                sx={{ py: 1.5, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
              </Button>
            </form>

            {/* Demo accounts */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                Tài khoản demo:
              </Typography>
              {[['admin','Admin'],['hr','HR'],['manager','Manager'],['employee','Employee'],['ketoan','Kế toán'],['truongphong','Trưởng phòng']].map(([u, r]) => (
                <Box key={u} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">{r}:</Typography>
                  <Typography variant="caption" fontWeight={600}
                    sx={{ cursor: 'pointer', color: '#6366f1' }}
                    onClick={() => setForm({ TenTaiKhoan: u, MatKhau: '123456' })}>
                    {u} / 123456
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;
