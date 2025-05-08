import React, { useState , useContext } from 'react';
import { Button } from '@mui/material';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Toolbar,
  Box,
  Tooltip
} from '@mui/material';
import { Home, Add, AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { DarkModeContext } from "../context/DarkModeContext"
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';


const drawerWidth = 240;
const collapsedWidth = 60;

function Menu() {
  const [open, setOpen] = useState(false);
  const value = useContext(DarkModeContext);
  console.log(value);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
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
            <MenuIcon />
          </IconButton>
        </Toolbar>
        <Toolbar sx={{ justifyContent: open ? 'flex-end' : 'center' }}>
        <Button onClick={() => value.setDarkMode(!value.darkMode)}>
            {value.darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </Button>
        </Toolbar>


        <List>
          <Tooltip title="피드" placement="right" disableHoverListener={open}>
            <ListItem button component={Link} to="/">
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              {open && <ListItemText primary="피드" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="등록" placement="right" disableHoverListener={open}>
            <ListItem button component={Link} to="/register">
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              {open && <ListItemText primary="등록" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="마이페이지" placement="right" disableHoverListener={open}>
            <ListItem button component={Link} to="/mypage">
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              {open && <ListItemText primary="마이페이지" />}
            </ListItem>
          </Tooltip>

        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* 메인 콘텐츠 영역 */}
      </Box>
    </Box>
  );
}

export default Menu;
