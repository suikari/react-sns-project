import { useEffect } from 'react';
import { Modal, Box, Typography, Avatar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const StoryViewModal = ({ open, handleClose, user }) => {
  useEffect(() => {
    if (user && user.stories.length > 0) {
      handleStoryView(user.stories[0]?.storyId);
    }
  }, [user]);

  const handleStoryView = async (storyId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://${process.env.REACT_APP_API_BASE_URL}/api/story/view/${storyId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
    } catch (err) {
      console.error('스토리 조회 실패:', err);
    }
  };

  if (!user) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        overflow: 'hidden', // 화면 밖으로 넘치지 않게
        position: 'relative',
      }}>
        {/* 닫기 버튼 */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            color: '#fff',
            zIndex: 10
          }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>

        {/* 유저 정보 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar src={user.profileImage} sx={{ width: 56, height: 56, mr: 2 }} />
          <Typography variant="h5" color="white">
            {user.username}의 스토리
          </Typography>
        </Box>

        {/* 스토리 미디어 */}
        {user.stories.map((story, idx) => (
          <Box
            key={idx}
            sx={{
              maxWidth: '90vw',
              maxHeight: '70vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {story.mediaType === 'image' ? (
              <img
                src={story.mediaPath}
                alt="story"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 16
                }}
              />
            ) : story.mediaType === 'video' ? (
              <video
                src={story.mediaPath}
                controls
                autoPlay
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 16
                }}
              />
            ) : (
              <Typography color="error">지원되지 않는 미디어 형식</Typography>
            )}
          </Box>
        ))}

        {/* 캡션 */}
        {user.stories[0]?.caption && (
          <Typography variant="h6" color="white" sx={{ mt: 2 }}>
            {user.stories[0].caption}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default StoryViewModal;
