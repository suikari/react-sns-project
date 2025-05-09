import React, { useState } from 'react';
import { TextField, Button, Alert, Box } from '@mui/material';
import axios from 'axios';
import AuthFormWrapper from '../components/AuthFormWrapper';
import { formField, formButton } from '../styles/formStyles';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom'; // useHistory 대신 useNavigate 사용

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수 호출

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3003/api/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      
      alert(`${user.username}님 환영합니다!`);
      navigate('/');
      // TODO: 라우팅 처리
    } catch (err) {
      setErrorMsg(err.response?.data?.message || '로그인 실패');
    }
  };

  const handleGoogleLogin = async (response) => {
    console.log(response);
  
    if (response.error) {
      setErrorMsg('구글 로그인 실패');
      return;
    }
    try {
      const tokenId = response.credential;
  
      // 구글 API를 통해 사용자 정보 요청
      const userInfo = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${tokenId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('User Info:', data);
          
          // 구글 로그인 정보를 받아오는 부분
          const { email, name: username, picture: profileImage } = data;
          const provider = 'google';
  
          // 요청을 보내기 전에 필요한 데이터를 담아보냄
          axios.post('http://localhost:3003/api/auth/social', {
            email,
            username,
            profileImage,
            provider,
          })
          .then((res) => {
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            alert(`${user.username}님 환영합니다!`);
            navigate('/');
          })
          .catch((err) => {
            console.error('로그인 API 요청 실패:', err);
            setErrorMsg(err.response?.data?.message || '로그인 처리 중 오류가 발생했습니다.');
          });
        })
        .catch((err) => {
          console.error('Failed to fetch user info:', err);
          setErrorMsg('구글 로그인 정보 요청 실패');
        });
  
    } catch (err) {
      setErrorMsg(err.response?.data?.message || '구글 로그인 실패');
    }
  };

  const goToSignup = () => {
    navigate('/signup'); // navigate 함수로 회원가입 페이지로 이동
  };

  return (
    <AuthFormWrapper title="로그인">
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <TextField
        label="이메일"
        sx={formField}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="비밀번호"
        type="password"
        sx={formField}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleLogin();
          }
        }}
      />
      <Button variant="contained" sx={formButton} onClick={handleLogin}>
        로그인
      </Button>

      <Box sx={{ mt: 2 }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setErrorMsg('구글 로그인 실패')}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={goToSignup}>
          회원가입
        </Button>
      </Box>
    </AuthFormWrapper>
  );
};

export default LoginPage;