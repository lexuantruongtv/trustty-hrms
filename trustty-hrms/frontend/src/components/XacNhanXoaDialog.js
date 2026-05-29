import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function XacNhanXoaDialog({ mo, tieuDe, noiDung, dangXuLy, onXacNhan, onDong }) {
  return (
    <Dialog open={mo} onClose={onDong} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
        <WarningAmberIcon />
        {tieuDe || 'Xác nhận xóa'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {noiDung || 'Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDong} disabled={dangXuLy}>
          Hủy
        </Button>
        <Button
          onClick={onXacNhan}
          color="error"
          variant="contained"
          disabled={dangXuLy}
        >
          {dangXuLy ? <CircularProgress size={20} color="inherit" /> : 'Xóa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
