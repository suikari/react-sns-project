import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Box, Stack, Typography, Chip, Button,
  IconButton, Modal
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const FeedEdit = ({ open, handleClose, postId }) => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [existingImages, setExistingImages] = useState([]); // 서버에 저장된 기존 이미지 URL들
  const [files, setFiles] = useState([]);                   // 새로 추가된 파일들
  const [previewUrls, setPreviewUrls] = useState([]);       // 새로 추가된 파일 미리보기

  const navigate = useNavigate();
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (open && postId) {
      const token = localStorage.getItem('token');

      // 피드 정보 조회
      axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed/${postId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
        .then(res => {
          const feed = res.data;
          setContent(feed.content || '');
          //setLocation(feed.location || '');
          setTags(feed.hashtags || []);        // hashtags가 배열이라고 가정
          setExistingImages(feed.files || []); // imageUrls가 배열이라고 가정
          console.log('test22',feed);
          console.log('test',existingImages);
          setFiles([]);
          setPreviewUrls([]);
          setTagInput('');
        })
        .catch(err => {
          console.error('피드 조회 실패:', err);
          alert('피드 정보를 불러오는데 실패했습니다.');
          handleClose();
        });
    }
  }, [open, postId]);

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, '#' + newTag]);
      }
      setTagInput('');
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (selectedFiles) => {
    setFiles((prev) => [...prev, ...selectedFiles]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    );
    handleFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 기존 이미지 삭제
  const handleExistingImageDelete = (idx) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  // 새로 추가된 이미지 삭제
  const handleNewPreviewDelete = (idx) => {
    setPreviewUrls(previewUrls.filter((_, i) => i !== idx));
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('location', location);
    tags.forEach(tag => formData.append('hashtags', tag));
    files.forEach(file => formData.append('files', file));
    formData.append('existingImages', JSON.stringify(existingImages)); // 서버에 남길 기존 이미지 정보

    axios.put(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed/${postId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    })
      .then(() => {
        alert('피드가 수정되었습니다.');
        handleClose();
        navigate('/');
      })
      .catch(err => {
        console.error('피드 수정 실패:', err);
        alert('수정 중 오류가 발생했습니다.');
      });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Box
        sx={{
          p: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
          width: 700,
          backgroundColor: 'white',
          marginTop: '10vh',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#000',
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" sx={{ mb: 2 }}>피드 수정</Typography>

        <TextField
          ref={textAreaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요."
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />

        {/* <TextField
          label="위치"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ mb: 2 }}
        /> */}

        <TextField
          label="태그 입력 (쉼표 또는 Enter)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInput}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          {tags.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              onDelete={() => setTags(tags.filter((_, i) => i !== idx))}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <input
            accept="image/*"
            id="upload-files"
            multiple
            type="file"
            hidden
            onChange={handleFileChange}
          />
          <label htmlFor="upload-files">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
          <Typography variant="body2">{files.length}개의 새 이미지 선택됨</Typography>
        </Stack>

        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            border: '2px dashed #aaa',
            borderRadius: 2,
            p: 2,
            mb: 2,
            textAlign: 'center',
            color: '#888',
          }}
        >
          여기로 이미지 드래그 앤 드롭
        </Box>

        {/* 기존 서버 이미지 미리보기 */}
        {existingImages.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>기존 이미지</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2, overflowX: 'auto' }}>
              {existingImages.map((url, idx) => (
                <Box key={idx} position="relative">
                  <img src={url.filePath} alt={`existing-${idx}`} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                  <IconButton
                    size="small"
                    onClick={() => handleExistingImageDelete(idx)}
                    sx={{ position: 'absolute', top: 2, right: 2, boxShadow: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </>
        )}

        {/* 새로 추가된 이미지 미리보기 */}
        {previewUrls.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>새 이미지</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2, overflowX: 'auto' }}>
              {previewUrls.map((url, idx) => (
                <Box key={idx} position="relative">
                  <img src={url} alt={`preview-${idx}`} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                  <IconButton
                    size="small"
                    onClick={() => handleNewPreviewDelete(idx)}
                    sx={{ position: 'absolute', top: 2, right: 2, boxShadow: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </>
        )}

        <Button variant="contained" fullWidth onClick={handleSubmit}>
          수정 완료
        </Button>
      </Box>
    </Modal>
  );
};

export default FeedEdit;
