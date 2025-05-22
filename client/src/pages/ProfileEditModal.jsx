import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Avatar, Box, Typography
} from '@mui/material';
import axios from 'axios';

export default function ProfileEditModal({ open, onClose, user, onUpdate }) {
  const [username, setUsername] = useState('');
  const [intro, setIntro] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setIntro(user.introduce || '');
      setPreview(user.profileImage || '');
    }
    console.log(user);
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const res = await axios.post(`http://${process.env.REACT_APP_API_BASE_URL}/api/users/check-username`, {
        username: username,
        id: user.id, // 본인의 id 전달
      });
    
      if (res.data.isDuplicate) {
        alert('이미 존재하는 이름입니다.');
        return;
      } 

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('username', username);
    formData.append('intro', intro);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const res = await axios.put(
        `http://${process.env.REACT_APP_API_BASE_URL}/api/users/${user.id}/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onUpdate(); // 부모 컴포넌트에서 프로필 갱신
      onClose(); // 모달 닫기
    } catch (err) {
      console.error('프로필 업데이트 실패:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>프로필 수정</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={2}>
          <Avatar src={preview} sx={{ width: 100, height: 100 }} />
          <Button variant="outlined" component="label">
            프로필 이미지 변경
            <input hidden accept="image/*" type="file" onChange={handleFileChange} />
          </Button>
          <TextField
            fullWidth
            label="사용자 이름"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            label="자기소개"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            multiline
            rows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained" color="primary">저장</Button>
      </DialogActions>
    </Dialog>
  );
}