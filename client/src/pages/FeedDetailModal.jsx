import { Box, Modal, Typography, Avatar, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function FeedDetailModal({ open, onClose, postId }) {
  const [post, setPost] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3003/api/feed/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(res.data);
      setCurrentIndex(0); // 초기화
    };

    fetchPost();
  }, [postId]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentIndex((prev) =>
        post?.files && prev < post.files.length - 1 ? prev + 1 : prev
      ),
    onSwipedRight: () =>
      setCurrentIndex((prev) => (post?.files && prev > 0 ? prev - 1 : prev)),
    trackMouse: true,
  });

  if (!post) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 600,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 2,
          mx: 'auto',
          mt: '5%',
          overflowY: 'auto',
        }}
      >
        {/* 작성자 정보 */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar src={post.user?.profileImage} />
          <Typography variant="body1" fontWeight="bold">
            {post.user?.username}
          </Typography>
        </Box>

        {/* 이미지 슬라이드 */}
        <Box position="relative" {...swipeHandlers}>
          {post.files?.length > 0 && (
            <img
              src={post.files[currentIndex]?.filePath}
              alt={`image-${currentIndex}`}
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          )}

          {/* 왼쪽 버튼 */}
          {currentIndex > 0 && (
            <IconButton
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)' }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}

          {/* 오른쪽 버튼 */}
          {post.files && currentIndex < post.files.length - 1 && (
            <IconButton
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)' }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}
        </Box>

        {/* 게시글 내용 */}
        <Box mt={2}>
          <Typography variant="body2">{post.content}</Typography>
        </Box>
      </Box>
    </Modal>
  );
}
