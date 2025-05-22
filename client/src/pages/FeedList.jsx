import React, { useEffect, useState , useRef , useCallback  , useLayoutEffect  } from 'react';
import axios from 'axios';
import {
  Box, CircularProgress, Stack, Avatar, Typography, Card, CardContent, IconButton,
  ToggleButton, ToggleButtonGroup, Button, TextField
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import FollowedUserSlider from '../components/FollowedUserSlider';
import FeedDetailModal from './FeedDetailModal'; 
import FeedEditModal from './FeedEdit'; 
import SendIcon from '@mui/icons-material/Send';

import FeedContent from './FeedContent';
import { getTimeAgo } from '../utils/timeAgo';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import "../styles/feedList.css";
import RecommendedFriends from '../components/RecommendedFriends';

const FeedList = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [openComments, setOpenComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [showReplyForm, setShowReplyForm] = useState({}); // 각 댓글에 대해 대댓글 작성 폼을 토글할 상태
  const [newReply, setNewReply] = useState('');
  const [editReplyId, setEditReplyId] = useState(null);
  const [editedReplyContent, setEditedReplyContent] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [sidevisible, setSdieVisible] = useState(true);


  // const [currentUserId, setUserId] = useState("");
  // const [flag, setFlag] = useState(false);
  const currentUserIdRef = useRef(null);

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModalWithPostId = (postId) => {
    console.log("33",postId);
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };


  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const limit = 10;
  const scrollRestoreRef = useRef(null);
  const scrollYRef = useRef(0);


  const navigate = useNavigate(); // 페이지 이동을 위한 함수 리턴
  

  // 🔽 컴포넌트 상태 추가
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenuPostId, setSelectedMenuPostId] = useState(null);

  const menuOpen = Boolean(anchorEl);

  // feed 불러오기 함수
  const fetchFeeds = async (pageNum = 1, filterValue = 'all') => {
    const offset = (pageNum - 1) * limit;
    

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://${process.env.REACT_APP_API_BASE_URL}/api/feed?offset=${offset}${filterValue !== 'all' ? `&filter=${filterValue}` : ''}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log('feed',res.data);
      if (pageNum === 1) {
        setFeeds(res.data);
      } else {
        setFeeds((prevFeeds) => [...prevFeeds, ...res.data]);
      }

      setHasMore(res.data.length > 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3) page 변경 시 새 페이지 데이터 호출 (page 1일 때는 필터 effect에서 이미 호출하므로 제외)
  useEffect(() => {
    const token = localStorage.getItem('token') || '';

    if (token !== '') {
      const dToken = jwtDecode(token);
      currentUserIdRef.current = dToken.id;
    } else {
      alert('로그인 후 이용 바랍니다.');
      navigate('/login');
    }

    setPage(1);
    setFeeds([]);
    setHasMore(true);
    fetchFeeds(1, filter);
  }, [filter]);

  useEffect(() => {
    if (page > 1) {
      fetchFeeds(page, filter);
    }
  }, [page]);

  useLayoutEffect(() => {
    if (page > 1 && feeds.length > 0) {
        window.scrollTo({ top: scrollYRef.current, behavior: 'auto' });
    }
  }, [feeds]);

  // 마지막 아이템에 붙일 ref 함수
  const lastFeedRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        scrollYRef.current = window.scrollY;
        setPage((prev) => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchSingleFeed = async (feedId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed/${feedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("sing",res.data);

      setFeeds((prevFeeds) =>
        prevFeeds.map((feed) => (feed.postId === feedId ? res.data : feed))
      );
    } catch (error) {
      console.error('피드 업데이트 실패:', error);
    }
  };

  console.log("teee",currentUserIdRef.current);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const toggleComment = (feedId) => {
    setOpenComments((prev) => ({ ...prev, [feedId]: !prev[feedId] }));
  };

  const handleCommentSubmit = async (feedId) => {
    if (!newComment.trim()) return;
  
    try {
      setLoadingComment(true);
      const token = localStorage.getItem('token');
  
      const response = await axios.post(
        'http://${process.env.REACT_APP_API_BASE_URL}/api/feed/comment', 
        {
          postId: feedId,
          content: newComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setNewComment('');
      fetchSingleFeed(feedId);
      
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleLikeClick = async (feedId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed/${feedId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchSingleFeed(feedId);

    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const handleEditComment = (commentId, currentContent) => {
    setEditCommentId(commentId);
    setEditedComment(currentContent);
  };

  const handleEditCommentSubmit = async (feedId, commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed/comment`, {  
        commentId: commentId, 
        content: editedComment,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditCommentId(null);
      setEditedComment('');

      fetchSingleFeed(feedId);
    } catch (error) {
      console.error('댓글 수정 실패:', error);
    }
  };

  const handleDeleteComment = async (feedId, commentId) => {
    try {
      if(!window.confirm('삭제하시면 복구할수 없습니다. \n 정말로 삭제하시겠습니까??')){
        return false;
      }

      const token = localStorage.getItem('token');
      await axios.delete(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed/comment/${commentId}`, { 
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchSingleFeed(feedId);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  const handleUserProfile = async (userId) => {
    navigate(`/userpage/${userId}`);
  };


  const toggleReplyForm = (commentId) => {
    setShowReplyForm((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleReplySubmit = async (feedId, commentId) => {
    if (!newReply.trim()) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `http://${process.env.REACT_APP_API_BASE_URL}/api/feed/comment`,
        {
          postId: feedId,
          content: newReply,
          parentId : commentId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewReply('');
      fetchSingleFeed(feedId); // 새로고침
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
    }
  };


  const handleDeleteReply = async (feedId, replyId) => {
    try {
      if (!window.confirm('삭제하시면 복구할 수 없습니다. 정말로 삭제하시겠습니까?')) {
        return;
      }

      const token = localStorage.getItem('token');
      await axios.delete(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed/comment/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchSingleFeed(feedId); // 새로고침
    } catch (error) {
      console.error('대댓글 삭제 실패:', error);
    }
  };

  const handleEditReplySubmit = async (feedId , replyId) => {
    try {

      const token = localStorage.getItem('token');
      await axios.put(
        `http://${process.env.REACT_APP_API_BASE_URL}/api/feed/comment`,
        {
          commentId : replyId,
          content: editedReplyContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 수정 후 상태 초기화 및 최신 댓글 목록 다시 가져오기
      setEditReplyId(null);
      setEditedReplyContent('');
      fetchSingleFeed(feedId); // 새로고침
    } catch (err) {
      console.error('대댓글 수정 실패:', err);
    }
  };


  // 메뉴 열기
  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMenuPostId(postId);
  };

  // 메뉴 닫기
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMenuPostId(null);
  };

  // 피드 수정 및 삭제 핸들러
  const handleEditPost = (postId) => {
    console.log('ed',postId);
    handleMenuClose();
    setSelectedPostId(postId);

    handleEditOpen();
    // 수정 로직 호출
    console.log('Edit', postId);
  };

  const handleDeletePost = (postId) => {
        console.log('de',postId);

    handleMenuClose();
    // 삭제 로직 호출
    console.log('Delete', postId);
  };

  const handleEditOpen = () => setEditOpen(true);
  
  const handleEditClose = () => {
    setEditOpen(false);
  }

  if (loading) {
    return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', mt: 4, px: 2 }}>
      <FollowedUserSlider />

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={handleFilterChange}
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          border: '1px solid #ddd',
          borderRadius: 2,
          '& .MuiToggleButton-root': {
            flex: 1,
            textAlign: 'center',
            '&.Mui-selected': {
              backgroundColor: '#007FFF',
              color: '#fff',
            },
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          },
        }}
      >
        <ToggleButton value="all">전체</ToggleButton>
        < ToggleButton value="following">팔로워</ToggleButton>
        <ToggleButton value="my">내 피드</ToggleButton>
        <ToggleButton value="mention">멘션</ToggleButton>
      </ToggleButtonGroup>

      {feeds.map((feed, idx) => (
        <Card 
            ref={
              feeds.length === idx + 1
                ? (node) => {
                    lastFeedRef(node); // intersection 감지용
                    scrollRestoreRef.current = node; // 위치 복원용
                  }
                : null
            } 

        key={feed.postId} sx={{ mb: 3, boxShadow: 3, borderRadius: 2 ,  position: 'relative'  }}>
          <CardContent sx={{ pb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2} onClick={()=>{
                handleUserProfile(feed.userId);
              }} sx={{cursor : 'pointer'}} >
              <Avatar src={feed.profileImage} sx={{ width: 40, height: 40 }} />
              <Typography  component="div" variant="subtitle1" sx={{ fontWeight: 'bold' }}>{feed.username}</Typography>
              <Typography variant="caption" sx={{ color: 'gray' }}>
                {getTimeAgo(feed.createdAt)}
              </Typography>
            </Stack>


            <Typography component="div"  sx={{ mt: 2, fontSize: 16, lineHeight: 1.5 }} > <FeedContent text={feed.content} /> </Typography>
          </CardContent>

          {feed.userId === currentUserIdRef.current && (
            <>
              <IconButton
                onClick={(e) => handleMenuOpen(e, feed.postId)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <MoreVertIcon sx={{ fontSize: 32 }} />

              </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen && selectedMenuPostId === feed.postId}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      ml: '-40px', // 메뉴 왼쪽으로 16px 이동
                      mt: '8px',   // 메뉴 위쪽으로 8px 내려서 아이콘과 간격 유지
                    },
                  }}
                >
                <MenuItem onClick={() => handleEditPost(feed.postId)}>수정</MenuItem>
                <MenuItem onClick={() => handleDeletePost(feed.postId)}>삭제</MenuItem>
              </Menu>
            </>
          )}

          {/* 👉 해시태그 */}
          {feed.hashtags && feed.hashtags.length > 0 && (
              <Box
                sx={{
                  mt: 1,
                  ml: '24px', // 아바타+간격(40px + spacing 8px)과 맞춤
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {feed.hashtags.map((tag, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                      mb : 1.5 ,
                    }}
                    // onClick={() => handleHashtagClick(tag)}
                  >
                    {tag}
                  </Typography>
                ))}
              </Box>
            )}

          {feed.files && feed.files.length > 0 && (
            <Box sx={{ display: 'flex', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', height: 400 }} 
            onClick={()=>{
              openModalWithPostId(feed.postId);
            }}>
              <Box sx={{ flex: 2, overflow: 'hidden' }}>
                <img src={feed.files[0].filePath} alt="feed-main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
              {feed.files.length > 1 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ flex: 1, borderBottom: '1px solid #ddd', overflow: 'hidden' }}>
                    <img src={feed.files[1].filePath} alt="feed-sub1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <img src={feed.files[2]?.filePath || ''} alt="feed-sub2" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: feed.files.length > 3 ? 0.7 : 1 }} />
                    {feed.files.length > 3 && (
                      <Box sx={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                         color: '#fff', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', fontSize: 24, fontWeight: 'bold'
                      }}>
                        + {feed.files.length - 3}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ p: 2 }}>
            <Typography component="div"  onClick={() => handleLikeClick(feed.postId)} variant="body2" sx={{ fontWeight: 'bold', display: 'inline', mr: 1 , cursor:'pointer' }}>
              <IconButton >
                <FavoriteIcon color={feed.liked === 1 ? 'error' : 'inherit'} />
              </IconButton>
              좋아요 {feed.likeCount || 0}개
            </Typography>
            
            <Typography component="div"  onClick={() => toggleComment(feed.postId)} variant="body2" sx={{ display: 'inline', ml: 1 , mr: 2 , cursor:'pointer' }}>
              <IconButton >
                <CommentIcon />
              </IconButton>
              {feed.comments ? feed.comments.length + feed.comments.reduce((sum, comment) => sum + (comment.replies?.length || 0), 0)  : 0}개 
             </Typography>

             {/* <Typography component="div" variant="body2" sx={{ fontWeight: 'bold', display: 'inline', mr: 1 , cursor:'pointer' }}>
                <IconButton >
                  <SendIcon />
                </IconButton>
             </Typography> */}

            {openComments[feed.postId] && (
              <Box sx={{ mt: 2, padding: 2,  borderRadius: 2 }}>
                {feed.comments && feed.comments.map((comment) => (
                  <Box key={comment.commentId} sx={{ mb: 2, padding: 1,  borderRadius: 1, boxShadow: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={comment.profileImage} sx={{ width: 30, height: 30 }} />
                      <Typography component="div"  variant="body2" sx={{ fontWeight: 'bold' }}>
                        {comment.username}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'gray' }}>
                        {getTimeAgo(comment.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography component="div"  variant="body2" sx={{ ml: 2 , mt : 1.5 , mb : 1 }}>
                      {editCommentId === comment.commentId ? (
                        <TextField
                          fullWidth
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          sx={{ mt: 1 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleEditCommentSubmit(feed.postId, comment.commentId);
                            }
                          }}
                        />
                      ) : (
                        comment.content
                      )}
                    </Typography>
                    {comment.id === currentUserIdRef.current && (
                    <>
                      {editCommentId === comment.commentId ? (
                        <Button onClick={() => handleEditCommentSubmit(feed.postId, comment.commentId)} sx={{ mt: 1 }}>
                          수정 완료
                        </Button>
                      ) : (
                        <IconButton onClick={() => handleEditComment(comment.commentId, comment.content)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={() => handleDeleteComment(feed.postId, comment.commentId)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                    )}
                    
                    {/* 대댓글 작성 버튼 및 폼 토글 */}
                    <Box mt={1}>
                      <Button
                        variant="outlined"
                        onClick={() => toggleReplyForm(comment.commentId)}
                        sx={{ fontSize: 12 }}
                      >
                        대댓글 작성
                      </Button>
    
                      {showReplyForm[comment.commentId] && (
                        <Box mt={1} sx={{ ml: 4 }}>
                          <TextField
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder="대댓글을 입력하세요..."
                            fullWidth
                            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                          />
                          <Button
                            onClick={() => handleReplySubmit(comment.postId, comment.commentId)}
                            variant="contained"
                            color="primary"
                            sx={{ mt: 1 }}
                            disabled={loadingComment}
                          >
                            {loadingComment ? '작성 중...' : '작성'}
                          </Button>
                        </Box>
                      )}
                    </Box>
    
                    {/* 대댓글 목록 */}
                    {comment.replies?.map((reply) => (
                      <Box key={reply.commentId} mb={1} sx={{ mt: 2, padding: 2, borderRadius: 2, ml: 4 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={reply.profileImage} />
                        <Typography variant="body2" fontWeight="bold">
                          {reply.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'gray' }}>
                          {getTimeAgo(reply.createdAt)}
                        </Typography>
                      </Box>

                      {/* 대댓글 수정 중일 때 / 아닐 때 분기 */}
                      {editReplyId === reply.commentId ? (
                        <Box sx={{ ml: 4 }}>
                          <TextField
                            value={editedReplyContent}
                            onChange={(e) => setEditedReplyContent(e.target.value)}
                            fullWidth
                            multiline
                            size="small"
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ ml: 4 }}>
                          {reply.content}
                        </Typography>
                      )}

                      {/* 대댓글 수정/삭제 버튼 (본인만) */}
                      {reply.id === currentUserIdRef.current && (
                        <Box mt={1} sx={{ ml: 4 }}>
                          {editReplyId !== reply.commentId ? (
                            <Button
                              onClick={() => {
                                setEditReplyId(reply.commentId);
                                setEditedReplyContent(reply.content);
                              }}
                              sx={{ fontSize: 12 }}
                            >
                              수정
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleEditReplySubmit(reply.postId, reply.commentId)}
                              sx={{ fontSize: 12 }}
                            >
                              수정 완료
                            </Button>
                          )}
                          <Button onClick={() => handleDeleteReply(reply.commentId)} sx={{ fontSize: 12 }}>
                            삭제
                          </Button>
                        </Box>
                      )}
                    </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}

            {openComments[feed.postId] && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="댓글 작성"
                  variant="outlined"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={loadingComment}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCommentSubmit(feed.postId);
                    }
                  }}

                />
                <Button
                  onClick={() => handleCommentSubmit(feed.postId)}
                  sx={{ mt: 1 }}
                  variant="contained"
                  disabled={loadingComment}
                >
                  {loadingComment ? '댓글 작성 중...' : '댓글 작성'}
                </Button>
              </Box>
            )}
          </Box>
        </Card>
      ))}

      {sidevisible && < RecommendedFriends />}


      <FeedDetailModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          postId={selectedPostId}
      />
      
      <FeedEditModal
        open={editOpen}
        handleClose={handleEditClose}
        postId={selectedPostId}
      />

    </Box>
  );
};

export default FeedList;
