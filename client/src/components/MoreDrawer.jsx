import React, { useContext } from 'react';
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Logout,
  AccountCircle
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { DarkModeContext } from '../context/DarkModeContext';

function MoreMenuDrawer({ anchorEl, open, onClose }) {
  const value = useContext(DarkModeContext);
  const navigate = useNavigate();

  return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        disableScrollLock={true} // ✅ 외부 스크롤을 막지 않음
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: 200,
            borderRadius: 2,
          },
        }}
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

        <ListItem button onClick={() => value.setDarkMode(!value.darkMode)}>
          <ListItemIcon>
            {value.darkMode ? <Brightness7 /> : <Brightness4 />}
          </ListItemIcon>
          <ListItemText primary="다크모드 전환" />
        </ListItem>
      </List>
    </Popover>
  );
}

export default MoreMenuDrawer;
