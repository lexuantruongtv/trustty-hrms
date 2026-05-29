import React from 'react';
import { Chip } from '@mui/material';

const colorMap = {
  'Đang làm việc': 'success',
  'Nghỉ việc': 'error',
  'Tạm nghỉ': 'warning',
  'Đang thực hiện': 'primary',
  'Hoàn thành': 'success',
  'Tạm dừng': 'warning',
  'Hủy': 'error',
  'Chờ duyệt': 'warning',
  'Đã duyệt': 'success',
  'Từ chối': 'error',
};

const StatusChip = ({ status, size = 'small' }) => (
  <Chip
    label={status}
    color={colorMap[status] || 'default'}
    size={size}
    sx={{ fontWeight: 600, fontSize: 12 }}
  />
);

export default StatusChip;
