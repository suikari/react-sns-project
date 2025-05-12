import React from 'react';
import {
  Box, Toolbar, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const NotificationDrawer = ({
  open,
  drawerWidth,
  collapsedWidth,
  notificationDrawerOpen,
  toggleNotificationDrawer,
  handleNotificationClick,
  notifications,
  handleDmClick,             // ✅ 추가: DM 클릭 처리 함수
  handleFeedModalOpen        // ✅ 추가: 피드 모달 열기 함수
}) => {
  // 알림 클릭 핸들러
  const onNotificationClick = (notification) => {

    handleNotificationClick(notification.id); // 🔹 읽음 처리 호출

    if (notification.type === 'dm') {
      handleDmClick(notification.relatedFeedId);
    } else {
      handleFeedModalOpen(notification.relatedFeedId);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: notificationDrawerOpen ? (open ? `${drawerWidth}px` : `${collapsedWidth}px`) : '-320px',
        width: 300,
        height: '100vh',
        backgroundColor: 'background.paper',
        boxShadow: 3,
        zIndex: 1201,
        overflowY: 'auto',
        transition: 'left 0.3s ease-in-out'
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        <IconButton onClick={toggleNotificationDrawer}>
          <CloseIcon />
        </IconButton>
      </Toolbar>

      <List>
        <ListItem>
          <ListItemText primary="알림 목록" primaryTypographyProps={{ fontWeight: 'bold' }} />
        </ListItem>
        {notifications.length === 0 ? (
          <ListItem>
            <ListItemText primary="새로운 알림이 없습니다." />
          </ListItem>
        ) : (
          notifications.map((item, idx) => (
            <ListItem
              key={idx}
              button
              onClick={() => onNotificationClick(item)}
              sx={{
                bgcolor: item.isRead === 1 ? 'inherit' : 'rgba(25, 118, 210, 0.1)',
              }}
            >
              <ListItemText
                primary={item.message}
                secondary={new Date(item.createdAt).toLocaleString()}
                primaryTypographyProps={{ fontWeight: item.isRead === 1 ? 'normal' : 'bold' }}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default NotificationDrawer;
