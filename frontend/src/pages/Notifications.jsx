import React, { useState, useEffect } from 'react';
import {
  Box, Card, List, ListItem, ListItemText, ListItemIcon, Typography,
  Divider, Button, Chip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { motion } from 'framer-motion';
import { getNotifications, markAllRead } from '../api/notifications';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';

const Notifications = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);

  const fetchData = () => getNotifications().then((r) => setItems(r.data.data || [])).catch(() => {});
  useEffect(() => { fetchData(); }, []);

  const handleMarkAll = async () => {
    await markAllRead();
    toast.success('Đã đánh dấu đọc tất cả');
    fetchData();
  };

  const unread = items.filter((n) => !n.DaDoc).length;

  return (
    <Box>
      <PageHeader title="Thông báo"
        subtitle={unread > 0 ? `${unread} chưa đọc` : 'Tất cả đã đọc'}
        action={unread > 0 && <Button variant="outlined" onClick={handleMarkAll}>Đánh dấu đọc tất cả</Button>}
      />
      <Card>
        {items.length === 0 ? <EmptyState message="Không có thông báo nào" /> : (
          <List disablePadding>
            {items.map((n, i) => (
              <motion.div key={n.MaTB} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <ListItem
                  sx={{
                    px: 3, py: 2,
                    bgcolor: n.DaDoc ? 'transparent' : 'action.hover',
                    borderLeft: n.DaDoc ? 'none' : '3px solid #6366f1',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <NotificationsIcon sx={{ color: n.DaDoc ? 'text.disabled' : '#6366f1' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={n.DaDoc ? 400 : 700}>{n.TieuDe}</Typography>
                        {!n.DaDoc && <Chip label="Mới" size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">{n.NoiDung}</Typography>
                        <Typography variant="caption" color="text.disabled">
                          {new Date(n.NgayTao).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {i < items.length - 1 && <Divider />}
              </motion.div>
            ))}
          </List>
        )}
      </Card>
    </Box>
  );
};

export default Notifications;
