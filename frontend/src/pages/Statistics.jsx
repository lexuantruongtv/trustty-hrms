import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Tab, Tabs, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Chip, MenuItem, Select,
  FormControl, InputLabel, Stack, LinearProgress, Avatar,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaidIcon from '@mui/icons-material/Paid';
import SavingsIcon from '@mui/icons-material/Savings';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/format';
import { getThongKeDuAn, getBangLuongCongTy } from '../api/thongKe';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const PIE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const KpiCard = ({ label, value, icon, gradient, sub, positive }) => (
  <Card sx={{ background: gradient, color: '#fff', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>{label}</Typography>
          <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.2 }}>{value}</Typography>
          {sub !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
              {positive ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
              <Typography variant="caption" sx={{ opacity: 0.9 }}>{sub}</Typography>
            </Stack>
          )}
        </Box>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>{icon}</Avatar>
      </Stack>
    </CardContent>
  </Card>
);

const trangThaiColor = (t) => ({ 'Hoan thanh': 'success', 'Dang thuc hien': 'primary', 'Tam dung': 'warning', 'Huy': 'error' }[t] || 'default');

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, boxShadow: 3 }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>{label}</Typography>
      {payload.map((p) => (
        <Stack key={p.name} direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.fill }} />
          <Typography variant="caption" color="text.secondary">{p.name}:</Typography>
          <Typography variant="caption" fontWeight={600}>{formatCurrency(p.value)}</Typography>
        </Stack>
      ))}
    </Box>
  );
};

export default function Statistics() {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <PageHeader title="Thong ke & Bao cao" subtitle="Phan tich tai chinh va nhan su toan cong ty" />
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }} TabIndicatorProps={{ style: { height: 3, borderRadius: 2 } }}>
          <Tab label="Thong ke du an" sx={{ fontWeight: 600 }} />
          <Tab label="Bang luong cong ty" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Card>
      {tab === 0 && <TabDuAn />}
      {tab === 1 && <TabBangLuong />}
    </Box>
  );
}
