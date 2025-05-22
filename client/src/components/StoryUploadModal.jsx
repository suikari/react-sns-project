// StoryUploadModal.jsx
import React, { useState } from 'react';
import {
  Box, Modal, Typography, Button, TextField
} from '@mui/material';
import axios from 'axios';

const StoryUploadModal = ({ open, handleClose, onUploadSuccess }) => {
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!media) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('file', media);
    formData.append('caption', caption);

    setUploading(true);
    try {
      await axios.post(`http://${process.env.REACT_APP_API_BASE_URL}/api/story`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setCaption('');
      setMedia(null);
      handleClose();
      if (onUploadSuccess) onUploadSuccess(); // 성공 시 부모에서 fetchStories 다시 호출
    } catch (err) {
      console.error('스토리 업로드 실패:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        width: 400, bgcolor: 'background.paper', p: 3,
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', borderRadius: 2
      }}>
        <Typography variant="h6" mb={2}>스토리 업로드</Typography>
        <input type="file" onChange={handleFileChange} />
        <TextField
          fullWidth
          label="캡션"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? '업로드 중...' : '업로드'}
        </Button>
      </Box>
    </Modal>
  );
};

export default StoryUploadModal;
