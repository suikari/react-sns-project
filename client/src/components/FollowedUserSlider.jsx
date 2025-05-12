import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { styled } from '@mui/system';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // JWT 디코딩용
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

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    const fetchFollowedUsers = async () => {
      try {
        const res = await axios.get(`http://localhost:3003/api/users/following/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
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
          팔로우한 유저가 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1, py: 2 }}>
      <Slider {...settings}>
        {followedUsers.map((user) => (
          <UserItem key={user.id}>
            <Link to={`/userpage/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Avatar
                src={user.profileImage}
                sx={{ width: 56, height: 56, mx: 'auto', mb: 0.5 }}
              />
              <Typography variant="caption" noWrap>
                {user.username}
              </Typography>
            </Link>
          </UserItem>
        ))}
      </Slider>
    </Box>
  );
};

export default FollowedUserSlider;
