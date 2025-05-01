import React, { useEffect } from 'react';
import { Route, Routes, useLocation , useNavigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Join from './components/Join'; // Join으로 변경
import Feed from './components/Feed';
import Register from './components/Register';
import MyPage from './components/MyPage';
import Menu from './components/Menu'; // Menu로 변경
import { jwtDecode } from "jwt-decode";

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/join';
  const navigate = useNavigate(); // 페이지 이동을 위한 함수 리턴


  let token = localStorage.getItem("token") || ''; // 로컬 스토리지에서 토큰 꺼내기
  let dToken = '';

  if (token != '') {
    dToken = jwtDecode(token) // 디코딩
  }


  useEffect (()=>{
    if (dToken == '') {
      navigate('/login');
    }
  },[dToken])


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {!isAuthPage && <Menu />} {/* 로그인과 회원가입 페이지가 아닐 때만 Menu 렌더링 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
