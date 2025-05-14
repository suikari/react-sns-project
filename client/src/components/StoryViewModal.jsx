import { useEffect } from 'react';
import { Modal, Box, Typography, Avatar } from '@mui/material';
import axios from 'axios';

const StoryViewModal = ({ open, handleClose, user }) => {
  useEffect(() => {
    if (user && user.stories.length > 0) {
      handleStoryView(user.stories[0]?.storyId);
    }
  }, [user]); // ✅ user가 바뀔 때마다 체크

  const handleStoryView = async (storyId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:3003/api/story/view/${storyId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
    } catch (err) {
      console.error('스토리 조회 실패:', err);
    }
  };

  if (!user) return null; // ✅ useEffect 아래로 이동

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        width: 400, bgcolor: 'background.paper', p: 3,
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', borderRadius: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={user.profileImage} sx={{ mr: 2 }} />
          <Typography variant="h6">{user.username}의 스토리</Typography>
        </Box>

        {user.stories.map((story, idx) => (
          <Box key={idx} sx={{ my: 2 }}>
            {story.mediaType === 'image' ? (
              <img
                src={story.mediaPath}
                alt="story"
                style={{ width: '100%', borderRadius: 8 }}
              />
            ) : story.mediaType === 'video' ? (
              <video
                src={story.mediaPath}
                controls
                style={{ width: '100%', borderRadius: 8 }}
              />
            ) : (
              <Typography color="error">지원되지 않는 미디어 형식</Typography>
            )}
            {story.caption && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {story.caption}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Modal>
  );
};

export default StoryViewModal;
