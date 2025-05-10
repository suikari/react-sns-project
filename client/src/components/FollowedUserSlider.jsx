// components/FollowedUserSlider.jsx
import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { styled } from '@mui/system';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// 예제 데이터 (나중에 API로 교체)
const followedUsers = [
  { id: 1, username: 'jenny', profileImage: '/images/user1.jpg' },
  { id: 2, username: 'mark', profileImage: '/images/user2.jpg' },
  { id: 3, username: 'sara', profileImage: '/images/user3.jpg' },
  { id: 4, username: 'tom', profileImage: '/images/user4.jpg' },
  { id: 5, username: 'emma', profileImage: '/images/user5.jpg' },
  { id: 6, username: 'john', profileImage: '/images/user6.jpg' },
  { id: 7, username: 'lisa', profileImage: '/images/user7.jpg' },
  { id: 5, username: 'emma', profileImage: '/images/user5.jpg' },
  { id: 6, username: 'john', profileImage: '/images/user6.jpg' },
  { id: 7, username: 'lisa', profileImage: '/images/user7.jpg' },
  { id: 5, username: 'emma', profileImage: '/images/user5.jpg' },
  { id: 6, username: 'john', profileImage: '/images/user6.jpg' },
  { id: 7, username: 'lisa', profileImage: '/images/user7.jpg' },
];

const ScrollContainer = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  padding: '12px 8px',
  gap: '16px',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const UserItem = styled(Box)({
  textAlign: 'center',
  width: 64,
  flexShrink: 0,
});

const FollowedUserSlider = () => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <ScrollContainer>
        {followedUsers.map(user => (
          <UserItem key={user.id}>
            <Avatar
              src={user.profileImage}
              sx={{ width: 56, height: 56, mx: 'auto', mb: 0.5 }}
            />
            <Typography variant="caption" noWrap>
              {user.username}
            </Typography>
          </UserItem>
        ))}
      </ScrollContainer>
    </Box>
  );
};

export default FollowedUserSlider;
