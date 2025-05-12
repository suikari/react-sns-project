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
import { useParams } from 'react-router-dom';

import { Avatar } from '@mui/material';
import Slider from 'react-slick';
import { jwtDecode } from 'jwt-decode';

const socket = io('http://localhost:3003');

const GroupChatPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [currentUserId, setUserid] = useState(1); // JWT에서 추출 예정
  const [unreadCounts, setUnreadCounts] = useState({});
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [inviteUserIds, setInviteUserIds] = useState('');
  const messagesEndRef = useRef(null);


  const [followedUsers, setFollowedUsers] = useState([]);



  const token = localStorage.getItem('token') ||  '';

  // 채팅방 불러오기
  useEffect(() => {

    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      setUserid(decoded.id);
      axios
        .get(`http://localhost:3003/api/users/following/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setFollowedUsers(res.data);
          fetchChatRooms();
        })
        .catch((err) => console.error('팔로잉 유저 불러오기 실패:', err));
    } catch (err) {
      console.error('토큰 디코딩 실패:', err);
    }
    

  }, []);

  const { roomId } = useParams();

  useEffect(() => {
    if (roomId) {
      setCurrentRoomId(parseInt(roomId)); // 문자열을 숫자로 변환
    }
  }, [roomId]);
  
  const fetchChatRooms = async () => {
    try {
      const res = await axios.get('http://localhost:3003/api/chat/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(res.data);
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
        console.log(res.data);
        // 읽음 처리
        socket.emit('markAsRead', { roomId: currentRoomId, userId: currentUserId });
        setUnreadCounts((prev) => ({ ...prev, [currentRoomId]: 0 }));
      });
  }, [currentRoomId]);

  // 수신 메시지 처리
  useEffect(() => {
    socket.on('receiveMessage', (msg) => {

      setChatRooms((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((room) => room.id === msg.roomId);
        if (index !== -1) {
          const [room] = updated.splice(index, 1);
          updated.unshift(room); // 맨 앞으로 이동
        }
        return updated;
      });

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
  }, [currentRoomId, currentUserId]);

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


  const handleFollowUserClick = async (targetUserId) => {
    try {
      const res = await axios.post(
        'http://localhost:3003/api/chat/direct',
        { targetUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const room = res.data;
      console.log("44",res.data);
      console.log("chat",chatRooms);
      // 이미 목록에 없으면 추가
      if (!chatRooms.find((r) => r.roomId === room.id)) {
        setChatRooms((prev) => [...prev, room]);
      }
      setCurrentRoomId(room.id); // 이동
    } catch (err) {
      console.error('DM 생성 실패:', err);
    }
  };

  const toggleUser = (id) => {
    setInviteUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };
  
  return (
    <Box display="flex" height="90vh" p={2}>
      {/* 사이드바 - 채팅방 목록 */}
      <Paper sx={{ width: 250, mr: 2, p: 1 }}>
        {/* 👇 팔로잉 사용자 슬라이더 */}
        <Box mb={2}>
          <Slider
            dots={false}
            infinite={false}
            speed={300}
            slidesToShow={4}
            slidesToScroll={2}
            swipeToSlide
            arrows={false}
          >
            {followedUsers.map((user) => (
              <Box
                key={user.id}
                textAlign="center"
                px={0.5}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleFollowUserClick(user.id)}
              >
                <Avatar
                  src={user.profileImage || '/images/default-profile.jpg'}
                  sx={{ width: 40, height: 40, mx: 'auto', mb: 0.5 }}
                />
                <Typography variant="caption" noWrap>
                  {user.username}
                </Typography>
              </Box>
            ))}
          </Slider>
        </Box>

        {/* 채팅방 목록 */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>
            채팅방
          </Typography>
          {/* <Button size="small" onClick={() => setOpenCreateDialog(true)}>
            +
          </Button> */}
        </Box>
        <List>
        {chatRooms.map((room) => {
          const isGroupChat = room.participants.length > 2;
          const roomName = isGroupChat ? "그룹 채팅" : `${room.participants[0].username}님과의 1:1 채팅`;

          return (
            <ListItemButton
              key={room.roomId}
              selected={currentRoomId === room.roomId}
              onClick={() => setCurrentRoomId(room.roomId)}
            >
              <ListItemText 
                primary={roomName}  // 1:1 채팅 또는 그룹 채팅으로 표시
                secondary={isGroupChat ? `참여자: ${room.participants.map(p => p.username).join(', ')}` : null}
              />
              {unreadCounts[room.roomId] > 0 && (
                <Badge color="secondary" badgeContent={unreadCounts[room.roomId]} />
              )}
            </ListItemButton>
          );
        })}
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
            margin="dense"
            label="채팅방 이름"
            fullWidth
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            초대할 팔로우한 유저 선택
          </Typography>
          <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
            {followedUsers.map((user) => (
              <ListItemButton
                key={user.id}
                onClick={() => toggleUser(user.id)}
                selected={inviteUserIds.includes(user.id)}
              >
                <Avatar
                  src={user.profileImage || '/images/default-profile.jpg'}
                  sx={{ width: 40, height: 40, mx: 'auto', mb: 0.5 }}
                />
                <ListItemText primary={user.username} />
              </ListItemButton>
            ))}
          </List>
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
