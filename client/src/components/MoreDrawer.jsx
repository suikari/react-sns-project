// components/MoreMenuDrawer.js
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Toolbar,
} from '@mui/material';
import {  Brightness4, Brightness7, Logout, AccountCircle, Close } from '@mui/icons-material';
import { Link  , useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';
import { useContext } from 'react';



function MoreMenuDrawer({ anchorEl, open, onClose }) {
  const drawerWidth = 200;
  const drawerRef = useRef();
  const value = useContext(DarkModeContext);

  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수 호출
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !anchorEl?.contains(event.target)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, anchorEl, onClose]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        ref: drawerRef,
        sx: {
          width: drawerWidth,
          top: anchorEl?.getBoundingClientRect().top ?? 64,
          left: anchorEl?.getBoundingClientRect().right ?? 240,
          height: 'auto',
          borderRadius: 2,
          boxShadow: 5,
          position: 'absolute'
        }
      }}
      variant="persistent"
      hideBackdrop
    >
      <List>

        <ListItem button component={Link} to="/mypage" onClick={onClose}>
          <ListItemIcon><AccountCircle /></ListItemIcon>
          <ListItemText primary="마이페이지" />
        </ListItem>

        <ListItem button onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
        }}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="로그아웃" />
        </ListItem>

        <ListItem button onClick={() => value.setDarkMode(!value.darkMode)} >
        <ListItemIcon>
            {value.darkMode ? <Brightness7 /> : <Brightness4 />}
        </ListItemIcon>
        <ListItemText primary="다크모드 전환" />
        </ListItem>

      </List>
    </Drawer>
  );
}

export default MoreMenuDrawer;
