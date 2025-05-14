import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { styled } from '@mui/system';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // JWT 디코딩용
import StoryUploadModal from './StoryUploadModal';
import StoryViewModal from './StoryViewModal';


import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// 스타일
const UserItem = styled(Box)({
  textAlign: 'center',
  padding: '0 8px',
});

const settings = {
  dots: false,
  infinite: false,
  speed: 300,
  slidesToShow: 6,
  slidesToScroll: 2,
  swipeToSlide: true,
  arrows: false,
  responsive: [
    { breakpoint: 960, settings: { slidesToShow: 5 } },
    { breakpoint: 600, settings: { slidesToShow: 4 } },
    { breakpoint: 400, settings: { slidesToShow: 3 } },
  ],
};

const FollowedUserSlider = () => {

  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUploadOpen = () => {
    setUploadModalOpen(true);
  };

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (err) {
      console.error('JWT 디코딩 실패:', err);
      return null;
    }
  };
  let currentUserId = getUserIdFromToken();

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    const fetchFollowedUsers = async () => {
      try {
        const res = await axios.get(`http://localhost:3003/api/users/followingStory/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('rere',res.data);
        setFollowedUsers(res.data);
      } catch (err) {
        console.error('팔로우 유저 목록 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedUsers();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (followedUsers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          팔로우 유저 스토리가 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1, py: 2 }}>
        <Slider {...settings}>
          {followedUsers.map((user) => {
            const isCurrentUser = user.userId === currentUserId;
            const hasStory = user.stories?.length > 0; // 또는 user.stories?.length > 0

            const avatarStyles = {
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 0.5,
              border: user.stories[0]?.viewed  ? '3px solid #ccc'  : '3px solid #ff006e',
              opacity: hasStory || isCurrentUser ? 1 : 0.5,
              transition: '0.3s',
            };

            const handleClick = () => {
              if (isCurrentUser) {
                if (hasStory) {
                  setSelectedUser(user); // 본인의 정보
                  setViewModalOpen(true);
                } else {
                  setUploadModalOpen(true);
                }
              } else if (hasStory) {
                setSelectedUser(user);
                setViewModalOpen(true);
              }
            };

            return (
              <Box key={user.id} sx={{ textAlign: 'center', px: 1 }}>
                <Box
                  onClick={handleClick}
                  sx={{
                    cursor: (hasStory || isCurrentUser) ? 'pointer' : 'default',
                    '&:hover': {
                      opacity: (hasStory || isCurrentUser) ? 0.8 : 0.5,
                    }
                  }}
                >
                  <Avatar src={user.profileImage} sx={avatarStyles} />
                  <Typography variant="caption" noWrap>
                    {isCurrentUser ? '나' : user.username}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Slider>
      </Box>

      <StoryUploadModal
        open={uploadModalOpen}
        handleClose={() => setUploadModalOpen(false)}
      />

      <StoryViewModal
        open={viewModalOpen}
        handleClose={() => setViewModalOpen(false)}
        user={selectedUser}
      />

    </>
  );
};

export default FollowedUserSlider;
