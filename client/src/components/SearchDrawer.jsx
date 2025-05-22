import React, { useEffect, useState } from 'react';
import {
  Box, Toolbar, IconButton, InputBase, List, ListItem, ListItemText,
  Avatar, CircularProgress, Typography, Divider
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
  const [recommendedFriends, setRecommendedFriends] = useState([]); // ✅ 추천 친구 상태
  const navigate = useNavigate();

  // 검색 기능
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
      const response = await axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/users/search/${searchQuery}`, {
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

  // ✅ 추천 친구 불러오기
  useEffect(() => {
    fetchRecommendedFriends();
  }, []);

  const fetchRecommendedFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/users/RandomFriends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendedFriends( response.data.recommendations || []);
    } catch (error) {
      console.error('추천 친구 불러오기 실패:', error);
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
        ) : searchQuery.trim() === '' ? (
          <ListItem>
            <ListItemText primary="검색어를 입력하세요." />
          </ListItem>
        )  : searchResults.length === 0 ? (
          <ListItem>
            <ListItemText primary="검색 결과가 없습니다." />
          </ListItem>
        ) : (
          searchResults.map((user, idx) => (
            <ListItem
              key={idx}
              alignItems="flex-start"
              onClick={() => {
                navigate('/userpage/' + user.id);
                toggleSearchDrawer();
              }}
              sx={{ cursor: 'pointer' }}
            >
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

        {/* ✅ 추천 친구 리스트 */}
        <Divider sx={{ my: 2 }} />
        <ListItem>
          <ListItemText primary="추천 친구" primaryTypographyProps={{ fontWeight: 'bold' }} />
        </ListItem>

        {recommendedFriends.length === 0 ? (
          <ListItem>
            <ListItemText primary="추천 친구가 없습니다." />
          </ListItem>
        ) : (
          recommendedFriends.map((friend, idx) => (
            <ListItem
              key={idx}
              alignItems="flex-start"
              onClick={() => {
                navigate('/userpage/' + friend.id);
                toggleSearchDrawer();
              }}
              sx={{ cursor: 'pointer' }}
            >
              <Avatar src={friend.profileImage} alt={friend.username} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {friend.username || '이름 없음'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {friend.email}
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
