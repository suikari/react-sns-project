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
  IconButton,
} from '@mui/material';
import io from 'socket.io-client';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Avatar } from '@mui/material';
import Slider from 'react-slick';
import { jwtDecode } from 'jwt-decode';
import DeleteIcon from '@mui/icons-material/Delete'; // 추가된 부분
import AttachFileIcon from '@mui/icons-material/AttachFile'; // 추가된 부분
import CloseIcon from '@mui/icons-material/Close';
import { getTimeAgo } from '../utils/timeAgo';

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
  const [followedUsers, setFollowedUsers] = useState([]);
  const [file, setFile] = useState(null); // 파일 업로드 상태
  const messagesEndRef = useRef(null);
  const [filePreview, setFilePreview] = useState(null); // 파일 미리보기 상태

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [beforeMessageId, setBeforeMessageId] = useState(null); // 가장 오래된 메시지 id
  const messagesBoxRef = useRef(null); // 채팅창 DOM 참조

  const token = localStorage.getItem('token') || '';

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

    setMessages([]);
    setBeforeMessageId(null); // 초기화
    setHasMore(true);


    // axios
    //   .get(`http://localhost:3003/api/chat/rooms/${currentRoomId}/messages`, {
    //     headers: { Authorization: `Bearer ${token}` },
    //   })
    //   .then((res) => {
    //     console.log(res.data);
    //     setMessages(res.data);
    //     // 읽음 처리
    //     socket.emit('markAsRead', { roomId: currentRoomId, userId: currentUserId });
    //     setUnreadCounts((prev) => ({ ...prev, [currentRoomId]: 0 }));
    //   });
  }, [currentRoomId]);

  useEffect(() => {
  if (hasMore && beforeMessageId === null && currentRoomId) {
    console.log('초기화 완료 후 메시지 로딩');
    
    console.log('load',currentRoomId);
    console.log('page',beforeMessageId);


    loadMessages();
  }
}, [hasMore, beforeMessageId, currentRoomId]);

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

  const handleSend = async () => {
    if (!inputMsg.trim() && !file) return;

    let fileUrl = null;
    let fileMeta = null;

    // 1. 파일이 있으면 먼저 서버에 업로드
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:3003/api/chat/messages/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json(); // { fileUrl: "...", fileName: "...", ... }
        fileUrl = result.fileUrl;
        fileMeta = {
          fileName: result.fileName,
          fileType: result.fileType,
        };
      } catch (error) {
        console.error('파일 업로드 실패:', error);
        return;
      }
    }

    // 2. socket으로 메시지 전송
    const msgData = {
      roomId: currentRoomId,
      senderId: currentUserId,
      content: inputMsg.trim(),
    };

    if (fileUrl) {
      msgData.fileUrl = fileUrl;
      msgData.fileName = fileMeta.fileName;
      msgData.fileType = fileMeta.fileType;
    }

    socket.emit('sendMessage', msgData);
    setInputMsg('');
    setFile(null);
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

  const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // 파일이 이미지나 비디오일 경우 미리보기
      if (selectedFile) {
        const fileURL = URL.createObjectURL(selectedFile);
        setFilePreview(fileURL); // 미리보기 URL 설정

        console.log(fileURL); // 여기서 찍은 URL이 blob:로 시작해야 합니다.
      }
  };

  const handleDeleteMessage = (messageId) => {
      if (!window.confirm('삭제하시면 복구할 수 없습니다. 정말로 삭제하시겠습니까?')) {
        return;
      }

    axios
      .delete(`http://localhost:3003/api/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId)); // 삭제된 메시지 제외
      })
      .catch((err) => console.error('메시지 삭제 실패:', err));
  };


  const loadMessages = async () => {
    if (isLoading || !hasMore) {
      console.error('메시지 호출 실패:');
      return;
    }

    //console.log('bf',beforeMessageId);

    setIsLoading(true);

    try {
      const res = await axios.get(`http://localhost:3003/api/chat/rooms/${currentRoomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 20,
          beforeMessageId: beforeMessageId,
        }
      });
      
      const newMessages = res.data;
      
      if (newMessages.length === 0) {
        setHasMore(false); // 더 이상 없음
      } else {
        setMessages((prev) => [...newMessages, ...prev]);
        setBeforeMessageId(newMessages[0].id); // 가장 오래된 메시지 id 갱신

        // 스크롤 위치 유지: 새 메시지 로드 전 scrollHeight - 로드 후 scrollHeight 유지
        const container = messagesBoxRef.current;
        if (container) {
          const scrollOffset = container.scrollHeight;
          setTimeout(() => {
            container.scrollTop = container.scrollHeight - scrollOffset;
          }, 0);
        }
      }
    } catch (err) {
      console.error('메시지 로딩 실패', err);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const container = messagesBoxRef.current;
    if (!container) return;

    const handleScroll = () => {
      //console.log('스크롤 위치:', container.scrollTop); // <- 이 로그가 찍히는지 확인
      if (container.scrollTop === 0 && hasMore && !isLoading) {
        //console.log('맨 위에 도달함, 메시지 로드 시도'); // <- 이 로그도 찍혀야 정상
        loadMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading]);

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
        </Box>
        <List>
          {chatRooms.map((room) => {
            const isGroupChat = room.participants.length > 2;
            const roomName = isGroupChat
              ? '그룹 채팅'
              : `${room.participants[0].username}님과의 1:1 채팅`;

            return (
              <ListItemButton
                key={room.roomId}
                selected={currentRoomId === room.roomId}
                onClick={() => setCurrentRoomId(room.roomId)}
              >
                <ListItemText
                  primary={roomName} // 1:1 채팅 또는 그룹 채팅으로 표시
                  secondary={isGroupChat ? `참여자: ${room.participants.map((p) => p.username).join(', ')}` : null}
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
          <Box flex={1} overflow="auto" mb={2} ref={messagesBoxRef}>
            {messages.map((msg, i) => (
              <Box
                key={i}
                mb={1}
                textAlign={msg.senderId === currentUserId ? 'right' : 'left'}
              >
                {/* 메시지가 있을 경우에만 출력 */}
                {msg.content?.trim() && (
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: msg.senderId === currentUserId ? '#1976d2' : '#eee',
                      color: msg.senderId === currentUserId ? 'white' : 'black',
                      display: 'inline-block',
                      borderRadius: '16px',
                      padding: '8px 16px',
                      maxWidth: '60%',
                    }}
                  >
                    {msg.content}
                  </Typography>
                )}

                {/* 파일 형식에 따른 파일 표시 */}
                {msg.fileUrl && (
                  <Box mt={1}>
                    {msg.fileType?.startsWith('image') ? (
                      // 이미지일 경우
                      <img
                        src={msg.fileUrl}
                        alt="파일"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                      />
                    ) : msg.fileType?.startsWith('video') ? (
                      // 비디오일 경우
                      <video
                        src={msg.fileUrl}
                        controls
                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                      />
                    ) : (
                      // 그 외 파일은 링크로 표시
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Typography variant="body2" color="primary">
                          파일 보기
                        </Typography>
                      </a>
                    )}
                  </Box>
                )}

              {/* 보낸 시간 */}
              <Typography
                variant="caption"
                sx={{
                  color: 'gray',
                  mt: 0.5,
                  textAlign: msg.senderId === currentUserId ? 'right' : 'left',
                  alignSelf: msg.senderId === currentUserId ? 'flex-end' : 'flex-start',
                }}
              >
                {getTimeAgo(msg.createdAt)}
              </Typography>

                {/* 읽은 여부 표시 */}
                {/* {msg.senderId !== currentUserId && (
                  <Typography variant="caption" sx={{ color: 'gray', mt: 1 }}>
                    {msg.isRead ? '읽음' : '안 읽음'}
                  </Typography>
                )} */}

                {/* 삭제 버튼 */}
                {msg.senderId === currentUserId && (
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteMessage(msg.id)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>


<Box
  sx={{
    borderTop: '1px solid #ccc',
    p: 2,
    backgroundColor: 'background.paper',
  }}
>
  {/* 파일 미리보기 (입력창 위에) */}
  {file && filePreview && (
  <Box
    mb={1}
    sx={{
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      height: 200, // 고정 높이
      backgroundColor: '#f5f5f5',
    }}
  >
    {/* 닫기 버튼 */}
    <IconButton
      size="small"
      onClick={() => {
        setFile(null);
        setFilePreview(null);
      }}
      sx={{
        position: 'absolute',
        top: 4,
        right: 4,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: '#fff',
        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>

    {/* 미리보기 콘텐츠 */}
    {file?.type.startsWith('image/') ? (
      <img
        src={filePreview}
        alt="미리보기"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // 또는 'contain'
        }}
      />
    ) : file?.type.startsWith('video/') ? (
      <video
        src={filePreview}
        controls
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // 'contain'도 가능
        }}
      />
    ) : (
      <Typography color="warning.main" p={1}>
        미리보기를 지원하지 않는 파일입니다
      </Typography>
    )}
  </Box>

  )}

  {/* 메시지 입력창 + 파일첨부 + 전송 버튼 */}
  <Box display="flex">
      <TextField
        fullWidth
        variant="outlined"
        value={inputMsg}
        onChange={(e) => setInputMsg(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="메시지를 입력하세요"
        sx={{ mr: 1 }}
        InputProps={{
          endAdornment: (
            <IconButton color="primary" component="label">
              <AttachFileIcon />
              <input type="file" hidden onChange={handleFileChange} />
            </IconButton>
          ),
        }}
      />
      <Button
        color="primary"
        variant="contained"
        onClick={handleSend}
        disabled={!inputMsg.trim() && !file}
      >
        전송
      </Button>
    </Box>
  </Box>
          </>
        ) : (
          <Typography variant="body1" align="center">
            채팅방을 선택하세요
          </Typography>
        )}
      </Paper>

      {/* 채팅방 생성 다이얼로그 */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>새 채팅방 만들기</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="채팅방 이름"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <TextField
            fullWidth
            label="초대할 사용자 ID (쉼표로 구분)"
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
