import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress, Alert,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import BusinessIcon from '@mui/icons-material/Business';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

function TheThongKe({ tieu_de, gia_tri, bieu_tuong, mau }) {
  return (
    <Card sx={{ height: '100%', borderLeft: `4px solid ${mau}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {tieu_de}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={mau}>
              {gia_tri}
            </Typography>
          </Box>
          <Box sx={{ color: mau, opacity: 0.7 }}>{bieu_tuong}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardTrang() {
  const { nguoiDung } = useAuth();
  const [tongQuan, setTongQuan] = useState(null);
  const [thongKeNhanSu, setThongKeNhanSu] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');

  useEffect(() => {
    async function taiDuLieu() {
      try {
        const [resTongQuan, resNhanSu] = await Promise.all([
          apiClient.get('/thong-ke/tong-quan'),
          ['Admin', 'HR', 'Manager'].includes(nguoiDung?.phanQuyen)
            ? apiClient.get('/thong-ke/nhan-su')
            : Promise.resolve({ data: null }),
        ]);
        setTongQuan(resTongQuan.data);
        setThongKeNhanSu(resNhanSu.data);
      } catch {
        setLoi('Không thể tải dữ liệu dashboard');
      } finally {
        setDangTai(false);
      }
    }
    taiDuLieu();
  }, [nguoiDung]);

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
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Xin chào, {nguoiDung?.tenNV}! Đây là tổng quan hệ thống hôm nay.
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <TheThongKe
            tieu_de="Tổng nhân viên"
            gia_tri={tongQuan?.tongNhanVien ?? 0}
            bieu_tuong={<PeopleIcon sx={{ fontSize: 40 }} />}
            mau="#1565c0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TheThongKe
            tieu_de="Dự án đang chạy"
            gia_tri={tongQuan?.tongDuAn ?? 0}
            bieu_tuong={<FolderSpecialIcon sx={{ fontSize: 40 }} />}
            mau="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TheThongKe
            tieu_de="Đơn nghỉ phép chờ duyệt"
            gia_tri={tongQuan?.donNghiPhepChoXuLy ?? 0}
            bieu_tuong={<EventBusyIcon sx={{ fontSize: 40 }} />}
            mau="#e65100"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TheThongKe
            tieu_de="Số phòng ban"
            gia_tri={tongQuan?.tongPhongBan ?? 0}
            bieu_tuong={<BusinessIcon sx={{ fontSize: 40 }} />}
            mau="#6a1b9a"
          />
        </Grid>
      </Grid>

      {thongKeNhanSu && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nhân viên theo phòng ban
                </Typography>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: thongKeNhanSu.theoPhongBan.map((pb) => pb.TenPB),
                    tickLabelStyle: { fontSize: 11 },
                  }]}
                  series={[{
                    data: thongKeNhanSu.theoPhongBan.map((pb) => pb.soLuong),
                    label: 'Số nhân viên',
                    color: '#1565c0',
                  }]}
                  height={280}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trạng thái nhân viên
                </Typography>
                <PieChart
                  series={[{
                    data: thongKeNhanSu.theoTrangThai.map((item, index) => ({
                      id: index,
                      value: item.soLuong,
                      label: item.TrangThai,
                    })),
                    highlightScope: { faded: 'global', highlighted: 'item' },
                  }]}
                  height={280}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
