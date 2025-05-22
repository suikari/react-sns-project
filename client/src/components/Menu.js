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
import FeedDetailModal from '../pages/FeedDetailModal'; 
import CollectionsIcon from '@mui/icons-material/Collections';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import FeedCreateModal from '../pages/FeedCreate';


import StoryModal from './StoryModal';


const drawerWidth = 240;
const collapsedWidth = 60;

function Menu() {
  const [open, setOpen] = useState(false);
  
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreButtonRef = useRef(null);

  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  const value = useContext(DarkModeContext);
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수 호출

  const toggleDrawer = () => setOpen(!open);


  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [storyOpen, setStoryOpen] = useState(false);
  const [feedopen, setFeedOpen] = useState(false);

  const openStoryModal = () => setStoryOpen(true);

  const openModalWithPostId = (postId) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  
  const closeAllDrawersAndModals = () => {
    setNotificationDrawerOpen(false);
    setMoreMenuOpen(false);
    setSearchDrawerOpen(false);
    setIsModalOpen(false);
    setFeedOpen(false);
  };


  const toggleNotificationDrawer = () => setNotificationDrawerOpen(prev => !prev);
  const handleNotificationToggle = () => {
    if (notificationDrawerOpen) {
      setNotificationDrawerOpen(false);
    } else {
      closeAllDrawersAndModals();
      setNotificationDrawerOpen(true);
    }
  };
  
  const toggleSearchDrawer = () => setSearchDrawerOpen(prev => !prev);
  const handleSearchToggle = () => {
    if (searchDrawerOpen) {
      // 검색창이 열려 있으면 닫기만 함
      setSearchDrawerOpen(false);
    } else {
      closeAllDrawersAndModals();
      setSearchDrawerOpen(true);
    }
  };
  
  const handleMoreMenuToggle = () => {
    if (moreMenuOpen) {
      setMoreMenuOpen(false);
    } else {
      closeAllDrawersAndModals();
      setMoreMenuOpen(true);
    }
  };

  const handleFeedToggle = () => {
    console.log('234','22');
    if (feedopen) {
      setFeedOpen(false); // 피드 작성 모달 닫기
    } else {
      closeAllDrawersAndModals(); // 다른 모달/드로어 닫기
      setFeedOpen(true); // 피드 작성 모달 열기
    }
  };
  
  const handleNotificationClick = async (id) => {
    const token = localStorage.getItem('token');

    try {
      console.log('test33','2342342');
      // 서버에 읽음 처리 요청
      await axios.post(`http://${process.env.REACT_APP_API_BASE_URL}/api/notifications/${id}/read`,{},{
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
    const token = localStorage.getItem('token');
  
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error('알림 가져오기 실패:', err);
      }
    };
  
    // 처음 로드 시 한 번 실행
    fetchNotifications();
  
    // 30초마다 알림 갱신
    const interval = setInterval(fetchNotifications, 10000);
  
    // cleanup
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    //if (notificationDrawerOpen) {
      const token = localStorage.getItem('token');

      axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/notifications`,{
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
            <ListItem button component={Link} to="/" onClick={closeAllDrawersAndModals}>
              <ListItemIcon><Home /></ListItemIcon>
              {open && <ListItemText primary="피드" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="등록" placement="right" disableHoverListener={open}>
            <ListItem button onClick={handleFeedToggle}>
            {/* <ListItem button component={Link} to="/register" onClick={closeAllDrawersAndModals}> */}
              <ListItemIcon><Add /></ListItemIcon>
              {open && <ListItemText primary="등록" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="마이페이지" placement="right" disableHoverListener={open} >
            <ListItem button component={Link} to="/mypage" onClick={closeAllDrawersAndModals}>
              <ListItemIcon><AccountCircle /></ListItemIcon>
              {open && <ListItemText primary="마이페이지" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="알림" placement="right" disableHoverListener={open}>
            <ListItem button onClick={handleNotificationToggle}>
              <ListItemIcon>
                <Badge badgeContent={notifications.filter(n => n.isRead == 0).length} color="error">
                  <Notifications />
                </Badge>
              </ListItemIcon>
              {open && <ListItemText primary="알림" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="검색" placement="right" disableHoverListener={open}>
            <ListItem button onClick={handleSearchToggle}>
              <ListItemIcon><Search /></ListItemIcon>
              {open && <ListItemText primary="검색" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="메시지" placement="right" disableHoverListener={open} >
            <ListItem button component={Link} to="/messages" onClick={closeAllDrawersAndModals}>
              <ListItemIcon><MailOutline /></ListItemIcon>
              {open && <ListItemText primary="메시지" />}
            </ListItem>
          </Tooltip>

          <Tooltip title="스토리" placement="right" disableHoverListener={open}>
            <ListItem button onClick={() => {
              closeAllDrawersAndModals();
              openStoryModal(); // 모달 여는 함수
            }}>
              <ListItemIcon><AddPhotoAlternateIcon /></ListItemIcon>
              {open && <ListItemText primary="스토리" />}
            </ListItem>
          </Tooltip>     

          <Tooltip title="더보기" placement="right" disableHoverListener={open}>
            <ListItem button ref={moreButtonRef} onClick={handleMoreMenuToggle}>
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
        handleDmClick={(roomId) => {
          // 예: 메시지 탭 열기 또는 특정 DM 페이지로 이동
          navigate(`/messages/${roomId}`);
        }}
        handleFeedModalOpen={(feedId) => {
          // 예: 피드 모달 열기
          openModalWithPostId(feedId);

        }}
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

      <FeedDetailModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          postId={selectedPostId}
      />

      <StoryModal open={storyOpen} handleClose={() => setStoryOpen(false)} />
      <FeedCreateModal open={feedopen} handleClose={handleFeedToggle} />

    </Box>
  );
}

export default Menu;
