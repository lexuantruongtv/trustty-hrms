import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, loading }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title || 'Xác nhận'}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ p: 2, gap: 1 }}>
      <Button onClick={onCancel} variant="outlined" disabled={loading}>Hủy</Button>
      <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Xác nhận'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
