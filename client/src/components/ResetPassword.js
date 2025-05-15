import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수 호출

  const handleSendCode = async () => {
    try {
      const res = await fetch('http://localhost:3003/api/auth/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(2);
        setError('');
      } else {
        setError(data.message || '이메일 전송 실패');
      }
    } catch (err) {
      console.error(err);
      setError('요청 중 오류 발생');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch('http://localhost:3003/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(3);
        setError('');
      } else {
        setError('인증코드가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('요청 중 오류 발생');
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetch('http://localhost:3003/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('비밀번호가 성공적으로 변경되었습니다!');
        setStep(4);
      } else {
        setError('비밀번호 변경 실패');
      }
    } catch (err) {
      console.error(err);
      setError('요청 중 오류 발생');
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <LockResetIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">비밀번호 재설정</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        {step === 1 && (
          <>
            <TextField
              label="가입된 이메일"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSendCode}
              disabled={!email.trim()}
            >
              인증코드 전송
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <TextField
              label="인증코드"
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleVerifyCode}
              disabled={!code.trim()}
            >
              인증코드 확인
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <TextField
              label="새 비밀번호"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleResetPassword}
              disabled={!newPassword.trim()}
            >
              비밀번호 재설정
            </Button>
          </>
        )}

        {step === 4 && (
            <>
                <Typography mt={2} color="green" align="center">
                    🎉 비밀번호가 성공적으로 변경되었습니다.
                </Typography>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/login')}
                    >
                    로그인 페이지로 이동
                </Button>
             </>   
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
