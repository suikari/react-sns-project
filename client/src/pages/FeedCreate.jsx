import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Box, Stack, Typography, Chip, Button,
  IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const FeedCreate = () => {
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

  const textAreaRef = useRef(null);
  const dropRef = useRef(null);
  const navigate = useNavigate(); // 페이지 이동을 위한 함수 리턴

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
  }, []);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    const mentionText = newContent.split('@').pop().split(' ')[0];
    if (mentionText.length > 0) {
      setIsMentioning(true);
      setMentionList(
        users.filter((user) =>
          user.username.toLowerCase().includes(mentionText.toLowerCase())
        )
      );
    } else {
      setIsMentioning(false);
      setMentionList([]);
    }
  };

  const handleMentionSelect = (user) => {
    setSelectedUser(user);
    const updatedContent = content.slice(0, content.lastIndexOf('@')) + `@${user.username} `;
    setContent(updatedContent);
    setUsers((prevList) => prevList.filter((item) => item.username !== user.username));
    setIsMentioning(false);
  };

  const renderMentionedText = (text) => {
    const regex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;

    text.replace(regex, (match, username, index) => {
      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index));
      }
      parts.push(
        <span key={index} style={{ color: 'blue', fontWeight: 'bold' }}>
          @{username}
        </span>
      );
      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  const calculateMentionBoxPosition = () => {
    const textarea = textAreaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPos);
    const lastMentionIndex = textBeforeCursor.lastIndexOf('@');
    if (lastMentionIndex === -1) return { top: 0, left: 0 };

    const mentionWidth = textBeforeCursor.slice(lastMentionIndex).length * 8;
    const textareaRect = textarea.getBoundingClientRect();

    return {
      top: textareaRect.top + textareaRect.height,
      left: textareaRect.left + mentionWidth,
    };
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
        setContent('');
        setFiles([]);
        setPreviewUrls([]);
        setTags([]);
        setTagInput('');
        setLocation('');
        navigate('/');

      })
      .catch((error) => {
        console.error('피드 등록 실패:', error);
        alert('등록 중 오류가 발생했습니다.');
      });
  };

  return (
    <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2}}>
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
        <Box sx={{
          position: 'absolute',
          top: calculateMentionBoxPosition().top,
          left: calculateMentionBoxPosition().left,
          backgroundColor: 'white',
          boxShadow: 1,
          width: '100%',
          zIndex: 10,
        }}>
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
        ref={dropRef}
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
  );
};

export default FeedCreate;
