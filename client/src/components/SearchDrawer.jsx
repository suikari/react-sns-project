// components/SearchDrawer.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Toolbar, IconButton, InputBase, List, ListItem, ListItemText,
  Avatar, CircularProgress, Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchDrawer = ({
  open,
  drawerWidth,
  collapsedWidth,
  searchDrawerOpen,
  toggleSearchDrawer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수 호출

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        fetchSearchResults();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchSearchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      const response = await axios.get(`http://localhost:3003/api/users/search/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: searchDrawerOpen ? (open ? `${drawerWidth}px` : `${collapsedWidth}px`) : '-320px',
        width: 300,
        height: '100vh',
        backgroundColor: 'background.paper',
        boxShadow: 3,
        zIndex: 1201,
        overflowY: 'auto',
        transition: 'left 0.3s ease-in-out',
        px: 2
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <SearchIcon sx={{ mr: 1 }} />
          <InputBase
            placeholder="사용자 검색"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <IconButton onClick={toggleSearchDrawer}>
          <CloseIcon />
        </IconButton>
      </Toolbar>

      <List>
        <ListItem>
          <ListItemText primary="검색 결과" primaryTypographyProps={{ fontWeight: 'bold' }} />
        </ListItem>

        {loading ? (
          <ListItem>
            <CircularProgress size={20} />
            <Box ml={2}>불러오는 중...</Box>
          </ListItem>
        ) : searchResults.length === 0 ? (
          <ListItem>
            <ListItemText primary="검색 결과가 없습니다." />
          </ListItem>
        ) : (
          searchResults.map((user, idx) => (
            <ListItem onClick={()=>{
                navigate('/userpage/'+user.id);
                toggleSearchDrawer();             
            }}
            key={idx} alignItems="flex-start">
              <Avatar src={user.profileImage} alt={user.username} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user.username || '이름 없음'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Typography variant="caption" color={user.isFollowed ? 'primary.main' : 'text.disabled'}>
                  {user.isFollowed ? '팔로우 중' : ''}
                </Typography>
              </Box>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default SearchDrawer;
