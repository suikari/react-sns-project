import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';

const ForgotEmail = () => {
  const [username, setUsername] = useState('');
  const [foundEmail, setFoundEmail] = useState('');
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  const handleFindEmail = async () => {
    try {
      const res = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/api/auth/find-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();

      if (data.success) {
        setFoundEmail(data.email);
        setNotFound(false);
      } else {
        setFoundEmail('');
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setFoundEmail('');
      setNotFound(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFindEmail();
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <EmailIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">아이디(이메일) 찾기</Typography>
        </Box>
        <TextField
          label="사용자 이름"
          fullWidth
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ mb: 3 }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleFindEmail}
          disabled={!username.trim()}
        >
          아이디 찾기
        </Button>

        {foundEmail && (
          <>
            <Alert severity="success" sx={{ mt: 3 }}>
              가입된 이메일: <strong>{foundEmail}</strong>
            </Alert>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/login')}
            >
              로그인 페이지로 이동
            </Button>
          </>
        )}

        {notFound && (
          <Alert severity="error" sx={{ mt: 3 }}>
            해당 사용자 이름으로 등록된 이메일이 없습니다.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotEmail;
