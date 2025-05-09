import React, { useEffect , useState } from 'react';
import { Route, Routes, useLocation , useNavigate } from 'react-router-dom';
import { Box, CssBaseline , Button } from '@mui/material';
import Login from './components/Login';
import Join from './components/Join'; // Join으로 변경
import Feed from './components/Feed';
import Register from './components/Register';
import MyPage from './components/MyPage';
import Menu from './components/Menu'; // Menu로 변경
import { jwtDecode } from "jwt-decode";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DarkModeContext } from "./context/DarkModeContext"

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FeedList from './pages/FeedList';
import FeedCreate from './pages/FeedCreate';
import UserPage from './pages/UserPage';
import GroupChat from './pages/GroupChat';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/join';
  const navigate = useNavigate(); // 페이지 이동을 위한 함수 리턴

  const [darkMode, setDarkMode] = useState(false); // 다크모드 여부

  let DarkMode = { darkMode , setDarkMode};


  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  let token = localStorage.getItem("token") || ''; // 로컬 스토리지에서 토큰 꺼내기
  let dToken = '';

  if (token != '') {
    dToken = jwtDecode(token) // 디코딩
  }


  useEffect (()=>{
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000); // 현재 시각 (초 단위)
  
        if (decoded.exp && decoded.exp < currentTime) {
          // 토큰 만료됨
          localStorage.removeItem('token');
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
        }
      } catch (err) {
        console.error('유효하지 않은 토큰입니다:', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      // 토큰 없음
      navigate('/login');
    }
  },[dToken])


  return (
    <ThemeProvider theme={theme}>
    <CssBaseline /> 
    <DarkModeContext.Provider value={DarkMode}>

    <Box sx={{ display: 'flex' }}>
      {!isAuthPage && <Menu />} {/* 로그인과 회원가입 페이지가 아닐 때만 Menu 렌더링 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<FeedList />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<FeedCreate />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<UserPage />} />
          <Route path="/userpage/:userId" element={<UserPage />} />
          <Route path="/messages" element={<GroupChat />} />

          
        </Routes>
      </Box>
    </Box>
    </DarkModeContext.Provider>

    </ThemeProvider>

  );
}

export default App;
