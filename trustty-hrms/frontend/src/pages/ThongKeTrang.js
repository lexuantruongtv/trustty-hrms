import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Alert, TextField, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import apiClient from '../services/apiClient';

function dinhDangTien(so) {
  if (!so) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(so);
}

export default function ThongKeTrang() {
  const [thongKeNhanSu, setThongKeNhanSu] = useState(null);
  const [thongKeDuAn, setThongKeDuAn] = useState(null);
  const [thongKeLuong, setThongKeLuong] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');
  const [namLuong, setNamLuong] = useState(new Date().getFullYear());

  useEffect(() => {
    async function taiDuLieu() {
      setDangTai(true);
      try {
        const [resNS, resDA, resLuong] = await Promise.all([
          apiClient.get('/thong-ke/nhan-su'),
          apiClient.get('/thong-ke/du-an'),
          apiClient.get('/thong-ke/luong', { params: { nam: namLuong } }),
        ]);
        setThongKeNhanSu(resNS.data);
        setThongKeDuAn(resDA.data);
        setThongKeLuong(resLuong.data);
      } catch {
        setLoi('Không thể tải dữ liệu thống kê');
      } finally {
        setDangTai(false);
      }
    }
    taiDuLieu();
  }, [namLuong]);

  if (dangTai) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loi) return <Alert severity="error">{loi}</Alert>;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Báo cáo & Thống kê
      </Typography>

      {/* Thống kê nhân sự */}
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Nhân sự</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Phân bổ nhân viên theo phòng ban
              </Typography>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: thongKeNhanSu?.theoPhongBan.map((pb) => pb.TenPB) || [],
                  tickLabelStyle: { fontSize: 10 },
                }]}
                series={[{
                  data: thongKeNhanSu?.theoPhongBan.map((pb) => pb.soLuong) || [],
                  label: 'Nhân viên',
                  color: '#1565c0',
                }]}
                height={260}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Phân bổ theo chức vụ
              </Typography>
              <PieChart
                series={[{
                  data: (thongKeNhanSu?.theoChucVu || []).map((item, i) => ({
                    id: i,
                    value: item.soLuong,
                    label: item.TenCV,
                  })),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  innerRadius: 40,
                }]}
                height={260}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Thống kê dự án */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Dự án</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Trạng thái dự án
              </Typography>
              <PieChart
                series={[{
                  data: (thongKeDuAn?.theoTrangThai || []).map((item, i) => ({
                    id: i,
                    value: item.soLuong,
                    label: item.TrangThai,
                  })),
                }]}
                height={220}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Nhân viên chưa được phân công dự án ({thongKeDuAn?.nhanVienChuaPhanCong?.length || 0} người)
              </Typography>
              <TableContainer sx={{ maxHeight: 220 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Mã NV</strong></TableCell>
                      <TableCell><strong>Họ tên</strong></TableCell>
                      <TableCell><strong>Phòng ban</strong></TableCell>
                      <TableCell><strong>Chức vụ</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(thongKeDuAn?.nhanVienChuaPhanCong || []).map((nv) => (
                      <TableRow key={nv.MaNV} hover>
                        <TableCell>{nv.MaNV}</TableCell>
                        <TableCell>{nv.TenNV}</TableCell>
                        <TableCell>{nv.TenPB || '—'}</TableCell>
                        <TableCell>{nv.TenCV || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {(!thongKeDuAn?.nhanVienChuaPhanCong || thongKeDuAn.nhanVienChuaPhanCong.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                          Tất cả nhân viên đã được phân công
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Thống kê lương */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4, mb: 2 }}>
        <Typography variant="h6">Chi phí lương</Typography>
        <TextField
          select size="small" label="Năm" value={namLuong}
          onChange={(e) => setNamLuong(e.target.value)} sx={{ width: 100 }}
        >
          {[2024, 2025, 2026, 2027].map((n) => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </TextField>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Chi phí lương theo tháng (năm {namLuong})
              </Typography>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: (thongKeLuong?.theoThang || []).map((t) => `T${t.Thang}`),
                }]}
                series={[{
                  data: (thongKeLuong?.theoThang || []).map((t) => Number(t.tongThucLinh)),
                  label: 'Tổng thực lĩnh (VNĐ)',
                  color: '#2e7d32',
                  valueFormatter: (v) => dinhDangTien(v),
                }]}
                height={260}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Chi phí theo phòng ban
              </Typography>
              {(thongKeLuong?.theoPhongBan || []).map((pb) => (
                <Box key={pb.TenPB} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{pb.TenPB || 'Chưa phân công'}</Typography>
                  <Chip label={dinhDangTien(pb.tongChiPhi)} size="small" color="primary" variant="outlined" />
                </Box>
              ))}
              {(!thongKeLuong?.theoPhongBan || thongKeLuong.theoPhongBan.length === 0) && (
                <Typography variant="body2" color="text.secondary">Chưa có dữ liệu</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
