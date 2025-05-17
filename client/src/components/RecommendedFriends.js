import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Paper,
  IconButton,
  Button,
  Tooltip,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ReplayIcon from '@mui/icons-material/Replay';
import PeopleIcon from '@mui/icons-material/People';
import axios from 'axios';

const RecommendedFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(() => {
    const stored = localStorage.getItem('recommendedFriendsVisible');
    return stored !== 'false';
  });
  const [isflag, setFlag] = useState(false); // 탭 상태 관리


  const [error, setError] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3003/api/users/RandomFriends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(
        response.data.recommendations.map(friend => ({
          ...friend,
          isFollowing: false, // 초기 팔로우 상태
        }))
      );
    } catch (error) {
      console.error('추천 친구 불러오기 실패:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchRecommendations();
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('recommendedFriendsVisible', 'false');
  };

  const handleOpen = () => {
    setVisible(true);
    localStorage.setItem('recommendedFriendsVisible', 'true');
  };

  const handleGoToProfile = (userId) => {
    window.location.href = `/userpage/${userId}`;
  };



    const handleFollow = async (userId) => {
      const token = localStorage.getItem('token') || '';
  
      try {
        await axios.post(`http://localhost:3003/api/users/${userId}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });


        setFriends((prevFriends) =>
          prevFriends.map((f) =>
          f.id === userId ? { ...f, isFollowing: true } : f)
        );
        handleFlag();

      } catch (err) {
        console.error('팔로우 실패', err);
      }
    };

    const handleFlag = async => {
        setFlag(!isflag);
    }

    const handleUnfollow = async (userId) => {
      const token = localStorage.getItem('token') || '';
  
      try {
        await axios.delete(`http://localhost:3003/api/users/${userId}/unfollow`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        
        setFriends((prevFriends) =>
          prevFriends.map((f) =>
          f.id === userId ? { ...f, isFollowing: false } : f)
        );

        handleFlag();

      } catch (err) {
        console.error('언팔로우 실패', err);
      }
    };

  return (
    <>
      {visible ? (
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            top: 80,
            right: 20,
            width: 240,
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 1300,
            p: 2,
            borderRadius: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">추천 친구</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Box textAlign="center" py={3}>
              <Typography color="error">불러오기 실패</Typography>
              <Button
                startIcon={<ReplayIcon />}
                variant="outlined"
                size="small"
                onClick={fetchRecommendations}
                sx={{ mt: 1 }}
              >
                다시 시도
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2} mt={1}>
              {friends.map((friend) => (
                <Grid item xs={12} key={friend.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardHeader
                      avatar={
                        <Avatar
                          src={friend.profileImage}
                          alt={friend.username}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleGoToProfile(friend.id)}
                        />
                      }
                      title={
                        <Typography
                          variant="subtitle1"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleGoToProfile(friend.id)}
                        >
                          {friend.username}
                        </Typography>
                      }
                      action={
                        <Tooltip title={friend.isFollowing ? '팔로우 중' : '팔로우'}>
                          <span>
                            <IconButton
                              onClick={() => 
                                { 
                                    if (friend.isFollowing) { 
                                        handleUnfollow(friend.id);
                                    } else {
                                        handleFollow(friend.id);
                                    }
                                }
                            }
                            >
                              <PersonAddAlt1Icon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      }
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      ) : (
        <Fade in={!visible}>
          <Tooltip title="추천 친구 열기">
            <IconButton
              onClick={handleOpen}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1300,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <PeopleIcon />
            </IconButton>
          </Tooltip>
        </Fade>
      )}
    </>
  );
};

export default RecommendedFriends;
