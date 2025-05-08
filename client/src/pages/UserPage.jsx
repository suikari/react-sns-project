import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, Box, Tabs, Tab, Typography, Card, CardContent, CardMedia } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

export default function UserPage() {
  const params = useParams();
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [followInfo, setFollowInfo] = useState({
    followers: [],
    following: [],
    mutuals: [],
  });

  useEffect(() => {
    if (params.userId) {
      setUserId(params.userId);
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      }
    }
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const token = localStorage.getItem('token');

      const [userRes, followRes, myFeedRes] = await Promise.all([
        axios.get(`http://localhost:3003/api/users/${userId}`),
        axios.get(`http://localhost:3003/api/users/follow/info/${userId}`),
        axios.get(`http://localhost:3003/api/feed?filter=my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUser(userRes.data[0]);
      setFollowInfo(followRes.data);
      setFeeds(myFeedRes.data);
    };

    fetchData();
  }, [userId]);

  if (!userId || !user) return <div>Loading...</div>;

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar src={user.profileImage} sx={{ width: 64, height: 64 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">{user.username}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        </Box>
      </Box>

      <Box mt={2} display="flex" justifyContent="space-between">
        <Box>
          <Typography variant="body2" fontWeight="bold">팔로워</Typography>
          <Typography variant="h6">{followInfo.followers.length}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" fontWeight="bold">팔로잉</Typography>
          <Typography variant="h6">{followInfo.following.length}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" fontWeight="bold">친구</Typography>
          <Typography variant="h6">{followInfo.mutuals.length}</Typography>
        </Box>
      </Box>

      <Box mt={3}>
        <Tabs>
          <Tab label="피드" />
          <Tab label="댓글" />
          <Tab label="좋아요" />
        </Tabs>
      </Box>

      <Box mt={3}>
        {feeds.length > 0 ? (
          feeds.map((feed) => (
            <Card key={feed.postId} sx={{ mb: 2, position: 'relative' }}>
              {/* 이미지가 없으면 기본 이미지 사용 */}
              <CardMedia
                component="img"
                height="200"
                image={feed.image || 'http://localhost:3003/uploads/noimage.jpg'} // 기본 이미지 링크 수정
                alt={feed.title}
                sx={{ objectFit: 'cover' }}
              />

              {/* 마우스를 올렸을 때 게시글 내용 보이기 */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  '&:hover': {
                    display: 'flex',
                    opacity: 1,
                  },
                }}
              >
                <Typography variant="body2" sx={{ p: 2 }}>
                  {feed.content}
                </Typography>
              </Box>

              <CardContent>
                <Typography variant="h6">{feed.title}</Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">피드가 없습니다.</Typography>
        )}
      </Box>
    </Box>
  );
}
