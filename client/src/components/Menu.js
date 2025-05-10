import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Toolbar,
  Box,
  Tooltip,
  Badge,
  Button
} from '@mui/material';
import {
  Home,
  Add,
  AccountCircle,
  Notifications,
  Search,
  MailOutline,
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  ChevronLeft, 
  ChevronRight,
  Close
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { DarkModeContext } from "../context/DarkModeContext";
import NotificationDrawer from './NotificationDrawer';
import MoreMenuDrawer from './MoreDrawer';
import SearchDrawer from './SearchDrawer';

const drawerWidth = 240;
const collapsedWidth = 60;

function Menu() {
  const [open, setOpen] = useState(false);
  
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreButtonRef = useRef(null);

  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const toggleSearchDrawer = () => setSearchDrawerOpen(prev => !prev);

  const value = useContext(DarkModeContext);
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수 호출

  const toggleDrawer = () => setOpen(!open);

  const toggleNotificationDrawer = () => setNotificationDrawerOpen(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  
  const handleNotificationClick = async (id) => {
    const token = localStorage.getItem('token');

    try {

      // 서버에 읽음 처리 요청
      await axios.post(`http://localhost:3003/api/notifications/${id}/read`,{},{
        headers: { Authorization: `Bearer ${token}` },
      })        
      .then(res => {
              // 프론트 상태 업데이트
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: 1 } : n))
        );

      })
      .catch(err => console.error(err));
  

    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  useEffect(() => {
    //if (notificationDrawerOpen) {
      const token = localStorage.getItem('token');

      axios.get('http://localhost:3003/api/notifications',{
          headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setNotifications(res.data);
          console.log(res.data);
        })
        .catch(err => console.error(err));
    //}
  }, [notificationDrawerOpen]);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          transition: 'width 0.3s',
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : collapsedWidth,
            overflowX: 'hidden',
            transition: 'width 0.3s',
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar sx={{ justifyContent: open ? 'flex-end' : 'center' }}>
          <IconButton onClick={toggleDrawer}>
            { open ?  <ChevronLeft /> : <ChevronRight/> }
          </IconButton>
        </Toolbar>

        <List>
          <Tooltip title="피드" placement="right" disableHoverListener={open}>
            <ListItem button component={Link} to="/">
              <ListItemIcon><Home /></ListItemIcon>
              {open && <ListItemText primary="피드" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="등록" placement="right" disableHoverListener={open}>
            <ListItem button component={Link} to="/register">
              <ListItemIcon><Add /></ListItemIcon>
              {open && <ListItemText primary="등록" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="마이페이지" placement="right" disableHoverListener={open}>
            <ListItem button component={Link} to="/mypage">
              <ListItemIcon><AccountCircle /></ListItemIcon>
              {open && <ListItemText primary="마이페이지" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="알림" placement="right" disableHoverListener={open}>
            <ListItem button onClick={toggleNotificationDrawer}>
              <ListItemIcon>
                <Badge badgeContent={notifications.filter(n => n.isRead == 0).length} color="error">
                  <Notifications />
                </Badge>
              </ListItemIcon>
              {open && <ListItemText primary="알림" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="검색" placement="right" disableHoverListener={open}>
            <ListItem button onClick={toggleSearchDrawer}>
              <ListItemIcon><Search /></ListItemIcon>
              {open && <ListItemText primary="검색" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="메시지" placement="right" disableHoverListener={open}>
            <ListItem button component={Link} to="/messages">
              <ListItemIcon><MailOutline /></ListItemIcon>
              {open && <ListItemText primary="메시지" />}
            </ListItem>
          </Tooltip>
       
          <Tooltip title="더보기" placement="right" disableHoverListener={open}>
            <ListItem button ref={moreButtonRef} onClick={() => setMoreMenuOpen(prev => !prev)}>
              <ListItemIcon><MenuIcon /></ListItemIcon>
              {open && <ListItemText primary="더보기" />}
            </ListItem>
          </Tooltip>
       
        </List>
      </Drawer>

      {/* 알림 패널 */}
      <NotificationDrawer
        open={open}
        drawerWidth={drawerWidth}
        collapsedWidth={collapsedWidth}
        notificationDrawerOpen={notificationDrawerOpen}
        toggleNotificationDrawer={toggleNotificationDrawer}
        notifications={notifications}
        handleNotificationClick={handleNotificationClick}
      />

      <MoreMenuDrawer
        anchorEl={moreButtonRef.current}
        open={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
      />

      <SearchDrawer
        open={open}
        drawerWidth={drawerWidth}
        collapsedWidth={collapsedWidth}
        searchDrawerOpen={searchDrawerOpen}
        toggleSearchDrawer={toggleSearchDrawer}
      />

      {/* 본문 영역 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* 메인 콘텐츠 렌더링 영역 */}
      </Box>
    </Box>
  );
}

export default Menu;
