import { Box, Avatar, Typography } from '@mui/material';
import { getInitials } from '../../utils/format';

// Format thời gian kiểu "HH:mm DD/MM/YYYY"
const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const hhmm = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const ddmm = d.toLocaleDateString('vi-VN');
  return `${hhmm} · ${ddmm}`;
};

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
const colorFor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

/**
 * ChatNotes — hiển thị danh sách ghi chú dạng chatbox
 * @param {Array} notes  - mảng ghi chú, mỗi item có: MaGC, NoiDung, NgayTao, nhanVien.TenNV
 * @param {string} currentName - tên người dùng hiện tại (để căn phải tin của mình)
 */
const ChatNotes = ({ notes = [], currentName }) => {
  const sorted = [...notes].sort((a, b) => new Date(a.NgayTao) - new Date(b.NgayTao));
  if (notes.length === 0) return (
    <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ py: 1 }}>
      Chưa có ghi chú nào
    </Typography>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {sorted.map((n) => {
        const name = n.nhanVien?.TenNV ?? 'Ẩn danh';
        const isMine = currentName && name === currentName;
        const color = colorFor(name);

        return (
          <Box key={n.MaGC} sx={{
            display: 'flex',
            flexDirection: isMine ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
            gap: 1,
          }}>
            {/* Avatar */}
            <Avatar sx={{ width: 32, height: 32, bgcolor: color, fontSize: 12, flexShrink: 0 }}>
              {getInitials(name)}
            </Avatar>

            {/* Bubble */}
            <Box sx={{ maxWidth: '75%' }}>
              {/* Tên + thời gian */}
              <Box sx={{
                display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.4,
                flexDirection: isMine ? 'row-reverse' : 'row',
              }}>
                <Typography variant="caption" fontWeight={700} sx={{ color }}>
                  {isMine ? 'Bạn' : name}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {formatDateTime(n.NgayTao)}
                </Typography>
              </Box>

              {/* Nội dung */}
              <Box sx={{
                px: 1.5, py: 1,
                bgcolor: isMine ? '#6366f1' : 'action.hover',
                color: isMine ? '#fff' : 'text.primary',
                borderRadius: isMine
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {n.NoiDung}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ChatNotes;
