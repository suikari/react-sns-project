import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  TextField,
  Button,
  Paper,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3003');

const GroupChatPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [currentUserId] = useState(1); // JWT에서 추출 예정
  const [unreadCounts, setUnreadCounts] = useState({});
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [inviteUserIds, setInviteUserIds] = useState('');
  const messagesEndRef = useRef(null);


  const token = localStorage.getItem('token') ||  '';

  // 채팅방 불러오기
  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const res = await axios.get('http://localhost:3003/api/chat/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatRooms(res.data);
      // 초기 안읽은 메시지 수 설정
      const counts = {};
      res.data.forEach((room) => {
        counts[room.id] = room.unreadCount || 0;
      });
      setUnreadCounts(counts);
    } catch (error) {
      console.error('채팅방 불러오기 실패:', error);
    }
  };

  // 채팅방 선택 시 메시지 로딩
  useEffect(() => {
    if (!currentRoomId) return;

    socket.emit('joinRoom', { roomId: currentRoomId });

    axios
      .get(`http://localhost:3003/api/chat/rooms/${currentRoomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages(res.data);
        // 읽음 처리
        socket.emit('markAsRead', { roomId: currentRoomId, userId: currentUserId });
        setUnreadCounts((prev) => ({ ...prev, [currentRoomId]: 0 }));
      });
  }, [currentRoomId]);

  // 수신 메시지 처리
  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      if (msg.roomId === currentRoomId) {
        setMessages((prev) => [...prev, msg]);
        // 읽음 처리
        socket.emit('markAsRead', { roomId: currentRoomId, userId: currentUserId });
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.roomId]: (prev[msg.roomId] || 0) + 1,
        }));
      }
    });

    return () => socket.off('receiveMessage');
  }, [currentRoomId]);

  // 스크롤 하단 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    socket.emit('sendMessage', {
      roomId: currentRoomId,
      senderId: currentUserId,
      content: inputMsg.trim(),
    });
    setInputMsg('');
  };

  const handleCreateRoom = async () => {
    try {
      const res = await axios.post(
        'http://localhost:3003/api/chat/rooms',
        {
          roomName: newRoomName,
          userIds: inviteUserIds.split(',').map((id) => parseInt(id.trim())),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChatRooms((prev) => [...prev, res.data]);
      setOpenCreateDialog(false);
      setNewRoomName('');
      setInviteUserIds('');
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
    }
  };

  return (
    <Box display="flex" height="90vh" p={2}>
      {/* 사이드바 - 채팅방 목록 */}
      <Paper sx={{ width: 250, mr: 2, p: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>
            채팅방
          </Typography>
          <Button size="small" onClick={() => setOpenCreateDialog(true)}>
            +
          </Button>
        </Box>
        <List>
          {chatRooms.map((room) => (
            <ListItemButton
              key={room.id}
              selected={currentRoomId === room.id}
              onClick={() => setCurrentRoomId(room.id)}
            >
              <ListItemText primary={room.roomName} />
              {unreadCounts[room.id] > 0 && (
                <Badge color="secondary" badgeContent={unreadCounts[room.id]} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* 채팅창 */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {currentRoomId ? (
          <>
            <Box flex={1} overflow="auto" mb={2}>
              {messages.map((msg, i) => (
                <Box
                  key={i}
                  mb={1}
                  textAlign={msg.senderId === currentUserId ? 'right' : 'left'}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: msg.senderId === currentUserId ? '#1976d2' : '#eee',
                      color: msg.senderId === currentUserId ? '#fff' : '#000',
                      p: 1,
                      borderRadius: 2,
                      display: 'inline-block',
                      maxWidth: '70%',
                    }}
                  >
                    {msg.content}
                  </Typography>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                placeholder="메시지를 입력하세요"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button variant="contained" onClick={handleSend}>
                전송
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="h6" color="textSecondary">
            채팅방을 선택해주세요.
          </Typography>
        )}
      </Paper>

      {/* 채팅방 생성 다이얼로그 */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>채팅방 생성</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="채팅방 이름"
            fullWidth
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="초대할 사용자 ID들 (쉼표로 구분)"
            fullWidth
            value={inviteUserIds}
            onChange={(e) => setInviteUserIds(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>취소</Button>
          <Button onClick={handleCreateRoom}>생성</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupChatPage;
