import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Modal, Typography, Avatar, IconButton, CircularProgress, LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 추가


const StoryModal = ({ open, handleClose }) => {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const fetchStories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/story/followed`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      if (res.data.length === 0) {
        alert('신규 스토리가 없습니다.');
        handleClose(); // 모달 닫기
        return;
      }
      
      setStories(res.data);
      setCurrentIndex(0);
    } catch (err) {
      console.error('스토리 가져오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setProgress(0);
    if (!paused) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 100 / (15 * 10); // 15초 동안 100%
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStories();
    } else {
      clearInterval(timerRef.current);
      setProgress(0);
    }
  }, [open]);

  useEffect(() => {
    if (stories.length > 0) {
      handleStoryView(stories[currentIndex]?.storyId);
      resetTimer();
    }
  }, [currentIndex, stories]);

  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current);
    } else {
      resetTimer();
    }
  }, [paused]);

  const handleTogglePause = () => setPaused((prev) => !prev);

  return (
    <Modal open={open} onClose={handleClose}>
        <Box
        onClick={handleTogglePause}
        sx={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            bgcolor: 'black', display: 'flex',
            justifyContent: 'center', alignItems: 'center',
            overflow: 'hidden', cursor: 'pointer'
        }}
        >
        {loading ? (
          <CircularProgress color="inherit" />
        ) : (
          <>
            {/* 프로필 영역 */}
            <Box
                onClick={(e) => {
                    e.stopPropagation(); // 클릭 이벤트 막기
                    const userId = stories[currentIndex]?.userId;
                    handleClose();
                    if (userId) navigate(`/userpage/${userId}`);
                    
                }}
                position="absolute"
                top={16}
                left={16}
                display="flex"
                alignItems="center"
                gap={1}
                bgcolor="rgba(0,0,0,0.5)"
                p={1}
                borderRadius={1}
                sx={{ cursor: 'pointer' }}
            >
                <Avatar src={stories[currentIndex]?.profileImage} />
                <Typography color="white">{stories[currentIndex]?.username}</Typography>
            </Box>

            <IconButton
              onClick={(e) => { e.stopPropagation(); prevStory(); }}
              sx={{ position: 'absolute', left: 20, color: 'white' }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>

            <IconButton
              onClick={(e) => { e.stopPropagation(); nextStory(); }}
              sx={{ position: 'absolute', right: 20, color: 'white' }}
            >
              <ArrowForwardIosIcon />
            </IconButton>

            <IconButton
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}
            >
              <CloseIcon />
            </IconButton>

            <Box width="100%" position="absolute" top={0}>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 5, bgcolor: 'rgba(255,255,255,0.2)' }} />
            </Box>

            <Box width="100%" height="100%" display="flex" justifyContent="center" alignItems="center">
              {stories[currentIndex]?.mediaType === 'image' ? (
                <img
                  src={stories[currentIndex]?.mediaPath}
                  alt="story"
                  style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
                />
              ) : (
                <video
                  src={stories[currentIndex]?.mediaPath}
                  autoPlay
                  muted
                  loop
                  style={{ maxHeight: '90%', maxWidth: '90%' }}
                />
              )}
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default StoryModal;
