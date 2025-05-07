import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  Stack,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FeedList = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedFeed, setSelectedFeed] = useState(null); // 선택된 피드
  const [open, setOpen] = useState(false); // 모달 열림 상태

  const fetchFeeds = async (filterValue = 'all') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3003/api/feed${filterValue !== 'all' ? `?filter=${filterValue}` : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFeeds(res.data);
    } catch (error) {
      console.error('피드 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds(filter);
  }, [filter]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  // 모달 열기
  const handleClickOpen = (feed) => {
    console.log('Selected Feed:', feed); // 디버깅 로그
    setSelectedFeed(feed);
    setOpen(true);
  };

  // 모달 닫기
  const handleClose = () => {
    console.log('Closing modal'); // 디버깅 로그
    setOpen(false);
    setSelectedFeed(null);
  };

  console.log('Is dialog open?', open); // 디버깅 로그

  if (loading) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', mt: 4, px: 2 }}>
      {/* 필터 버튼 */}
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={handleFilterChange}
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          border: '1px solid #ddd',
          borderRadius: 2,
          '& .MuiToggleButton-root': {
            flex: 1,
            textAlign: 'center',
            '&.Mui-selected': {
              backgroundColor: '#007FFF',
              color: '#fff',
            },
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          },
        }}
      >
        <ToggleButton value="all">전체</ToggleButton>
        <ToggleButton value="my">내 피드</ToggleButton>
        <ToggleButton value="mention">멘션</ToggleButton>
      </ToggleButtonGroup>

      {/* 피드 리스트 */}
      {feeds.map((feed) => (
        <Card onClick={() => handleClickOpen(feed)} key={feed.id} sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ pb: 2 }}>
            {/* 사용자 정보 */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar src={feed.profileImage} sx={{ width: 40, height: 40 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{feed.userName}</Typography>
            </Stack>

            {/* 게시물 내용 */}
            <Typography sx={{ mt: 2, fontSize: 16, lineHeight: 1.5 }}>{feed.content}</Typography>
          </CardContent>

            {/* 게시물 이미지들 */}
            {feed.files && feed.files.length > 0 && (
            <Box sx={{ display: 'flex', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', height: 400 }}>
                <Box sx={{ flex: 2, overflow: 'hidden' }}>
                <img
                    src={feed.files[0].filePath}
                    alt="feed-img-1"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                </Box>

                {feed.files.length > 1 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1, borderBottom: '1px solid #ddd', overflow: 'hidden' }}>
                    <img
                        src={feed.files[1].filePath}
                        alt="feed-img-2"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    </Box>

                    <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <img
                        src={feed.files[2]?.filePath || ''}
                        alt="feed-img-3"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: feed.files.length > 3 ? 0.7 : 1 }}
                    />
                    {feed.files.length > 3 && (
                        <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 24,
                            fontWeight: 'bold',
                        }}
                        >
                        +{feed.files.length - 3}
                        </Box>
                    )}
                    </Box>
                </Box>
                )}
            </Box>
            )}

          {/* 좋아요 + 태그 + 작성일 */}
          <Box sx={{ p: 2 }}>
            {/* 좋아요 수 */}
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              ❤️ 좋아요 {feed.likes || 0}개
            </Typography>

            {/* 태그 */}
            {feed.tags && feed.tags.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {feed.tags.map((tag, index) => (
                  <Box key={index} sx={{ bgcolor: '#e0f7fa', px: 1.2, py: 0.5, borderRadius: 1, fontSize: 12 }}>
                    #{tag}
                  </Box>
                ))}
              </Stack>
            )}

            {/* 작성일 */}
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 1 }}>
              {new Date(feed.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Card>
      ))}

      {/* 상세보기 모달 */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">피드 상세보기</Typography>
            <IconButton onClick={handleClose}><CloseIcon /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedFeed && (
            <Box>
              <Typography variant="h6">{selectedFeed.userName}</Typography>
              <Typography sx={{ mt: 2 }}>{selectedFeed.content}</Typography>

              {selectedFeed.files?.length > 0 && (
                <CardMedia
                  component="img"
                  image={selectedFeed.files[0].filePath}
                  alt="feed-image"
                  sx={{ mt: 2, maxHeight: 400, objectFit: 'cover', borderRadius: 1 }}
                />
              )}

              {/* 좋아요 수 */}
              <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
                ❤️ 좋아요 {selectedFeed.likes || 0}개
              </Typography>

              {/* 태그 */}
              {selectedFeed.tags?.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  {selectedFeed.tags.map((tag, index) => (
                    <Box key={index} sx={{ bgcolor: '#e0f7fa', px: 1.2, py: 0.5, borderRadius: 1, fontSize: 12 }}>
                      #{tag}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedList;
