import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Avatar, Typography, Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignupForm = ({ onSuccess }) => {

  const navigate = useNavigate(); // 페이지 이동을 위한 함수 리턴
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifySent, setVerifySent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (profileImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(profileImage);
    }
  }, [profileImage]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const sendVerification = async () => {
    try {
        console.log("test",'');
      await axios.post('http://localhost:3003/api/auth/send-verification', { email: form.email });
      setVerifySent(true);
    } catch (err) {
      setErrorMsg('인증 메일 전송 실패');
    }
  };

  const verifyCode = async () => {
    try {
        const res = await axios.post('http://localhost:3003/api/auth/verify-code', {
        email: form.email,
        code: verificationCode,
      });
      if (res.data.success) {
        setEmailVerified(true);
      } else {
        setErrorMsg('인증 코드가 올바르지 않습니다.');
      }
    } catch {
      setErrorMsg('이메일 인증 실패');
    }
  };

  const handleSubmit = async () => {
    if (!emailVerified) return setErrorMsg('이메일 인증을 완료해주세요.');
    if (form.password !== form.confirmPassword) return setErrorMsg('비밀번호가 일치하지 않습니다.');

    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('email', form.email);
    formData.append('password', form.password);
    if (profileImage) formData.append('profileImage', profileImage);

    try {
        await axios.post("http://localhost:3003/api/auth/signup", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
      alert("회원가입 완료!");
      navigate('/login');

    } catch (err) {
      setErrorMsg(err.response?.data?.message || '회원가입 실패');
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" mb={2}>회원가입</Typography>

      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <TextField
        fullWidth label="이름" name="username" value={form.username}
        onChange={handleChange} margin="normal"
      />
      <TextField
        fullWidth label="이메일" name="email" value={form.email}
        onChange={handleChange} margin="normal"
      />

      <Button
        fullWidth variant="outlined" onClick={sendVerification}
        disabled={verifySent} sx={{ my: 1 }}
      >
        이메일 인증코드 보내기
      </Button>

      {verifySent && !emailVerified && (
        <>
          <TextField
            fullWidth label="인증 코드" value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            margin="normal"
          />
          <Button fullWidth variant="contained" onClick={verifyCode}>
            인증 확인
          </Button>
        </>
      )}

      <TextField
        fullWidth label="비밀번호" name="password" type="password"
        onChange={handleChange} margin="normal"
      />
      <TextField
        fullWidth label="비밀번호 확인" name="confirmPassword" type="password"
        onChange={handleChange} margin="normal"
      />

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Avatar src={preview} sx={{ width: 64, height: 64, mr: 2 }} />
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </Box>

      <Button
        fullWidth variant="contained" sx={{ mt: 3 }}
        onClick={handleSubmit}
      >
        회원가입
      </Button>
    </Box>
  );
};

export default SignupForm;
