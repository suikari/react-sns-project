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

const FeedCreate = ({ open, handleClose }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState('');
  const [users, setUsers] = useState([]);
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionList, setMentionList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const textAreaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3003/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('사용자 목록 가져오기 실패:', error);
      }
    };
    fetchUsers();

    if (open) {
      setContent('');
      setFiles([]);
      setPreviewUrls([]);
      setTags([]);
      setTagInput('');
      setLocation('');
      setMentionList([]);
    }
  }, [open]);

  /* ② handleChange – 커서 바로 앞 멘션만 검사 -------------------- */
  const handleChange = (e) => {
    const value     = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(value);
    setCursorPosition(cursorPos);

    const before     = value.slice(0, cursorPos);
    const atIndex    = before.lastIndexOf('@');          // 직전 @
    const mentionRaw = atIndex !== -1 ? before.slice(atIndex + 1) : '';
    const validQuery = /^[\w가-힣]{1,20}$/.test(mentionRaw); // 한글/영문/숫자

    if (atIndex !== -1 && validQuery) {
      setMentionList(
        users.filter(u =>
          u.username.toLowerCase().includes(mentionRaw.toLowerCase())
        )
      );
      setIsMentioning(true);

      // 자동완성 위치
      setMentionPosition({
        x: e.target.offsetLeft + cursorPos * 8,
        y: e.target.offsetTop  + e.target.scrollTop + e.target.clientHeight
      });
    } else {
      setIsMentioning(false);
    }
  };


const handleMentionSelect = (user) => {
  const cursorPos = cursorPosition;
  const before = content.slice(0, cursorPos);
  const after = content.slice(cursorPos);

  // '@'를 기준으로 나누어 멘션 배열을 만듬
  const beforeAt = before.split('@');
  
  console.log('b',beforeAt);

  // '@'가 여러 번 있는 경우 마지막 '@'만 처리할 수 있도록
  const lastMentionPart = beforeAt[beforeAt.length - 1];
  console.log('lb',lastMentionPart);

  // 마지막 멘션이 공백이나 특수문자가 포함되면 처리하지 않음
  if (/[\s@]/.test(lastMentionPart)) {
    setIsMentioning(false);
    return;
  }

  // 마지막 멘션을 사용자 이름으로 교체
  const newContent = before.slice(0, before.lastIndexOf('@')) + `@${user.username} ` + after;

  setContent(newContent);
  setIsMentioning(false);
};



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

  const handleSubmit = () => {
    if (!content.trim()) return alert('내용을 입력해주세요.');

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('location', location);
    tags.forEach((tag) => formData.append('hashtags', tag));
    files.forEach((file) => formData.append('files', file));

    axios
      .post('http://localhost:3003/api/feed', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        alert('피드가 등록되었습니다.');
        handleClose();
        navigate('/');
      })
      .catch((error) => {
        console.error('피드 등록 실패:', error);
        alert('등록 중 오류가 발생했습니다.');
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

        <Typography variant="h6" sx={{ mb: 2 }}>피드 작성</Typography>

        <TextField
          ref={textAreaRef}
          value={content}
          onChange={handleChange}
          placeholder="무슨 일이 있었나요?"
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />

        {isMentioning && mentionList.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: mentionPosition.y,
              left: mentionPosition.x,
              backgroundColor: 'white',
              boxShadow: 1,
              width: '200px',
              zIndex: 10,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {mentionList.map((user) => (
              <Box
                key={user.id}
                sx={{
                  padding: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}
                onClick={() => handleMentionSelect(user)}
              >
                {user.username}
              </Box>
            ))}
          </Box>
        )}

        <TextField
          label="위치"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ mb: 2 }}
        />

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
          <Typography variant="body2">{files.length}개의 이미지 선택됨</Typography>
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

        {previewUrls.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mb: 2, overflowX: 'auto' }}>
            {previewUrls.map((url, idx) => (
              <Box key={idx} position="relative">
                <img src={url} alt={`preview-${idx}`} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                <IconButton
                  size="small"
                  onClick={() => {
                    setPreviewUrls(previewUrls.filter((_, i) => i !== idx));
                    setFiles(files.filter((_, i) => i !== idx));
                  }}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    boxShadow: 1,
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        <Button variant="contained" fullWidth onClick={handleSubmit}>
          등록하기
        </Button>
      </Box>
    </Modal>
  );
};

export default FeedCreate;
