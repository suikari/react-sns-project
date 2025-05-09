import { Box, Modal, Typography, Avatar, IconButton, Button, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';


export default function FeedDetailModal({ open, onClose, postId }) {
  const [post, setPost] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [editedComment, setEditedComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [editedReply, setEditedReply] = useState('');
  const [editReplyId, setEditReplyId] = useState(null);
  const [loadingComment, setLoadingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState({}); // 각 댓글에 대해 대댓글 작성 폼을 토글할 상태

  // fetchPost 함수
  const fetchPost = async () => {
    if (!postId) return;

    const token = localStorage.getItem('token');
    const res = await axios.get(`http://localhost:3003/api/feed/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPost(res.data);
    console.log(res.data);
    setCurrentIndex(0); // 이미지 슬라이드 초기화
  };

  useEffect(() => {
    if (open && postId) {
      fetchPost(); // postId가 변경되거나 모달이 열릴 때마다 fetchPost 호출
    }
  }, [postId, open]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentIndex((prev) =>
        post?.files && prev < post.files.length - 1 ? prev + 1 : prev
      ),
    onSwipedRight: () =>
      setCurrentIndex((prev) => (post?.files && prev > 0 ? prev - 1 : prev)),
    trackMouse: true,
  });

  const handleCommentSubmit = async (feedId) => {
    if (!newComment.trim()) return;

    try {
      setLoadingComment(true);
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:3003/api/feed/comment',
        {
          postId: feedId,
          content: newComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewComment('');
      setShowComments(true); // 댓글 추가 후 자동으로 펼쳐짐
      fetchPost(); // 새로고침
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDeleteComment = async (feedId, commentId) => {
    try {
      if (!window.confirm('삭제하시면 복구할 수 없습니다. 정말로 삭제하시겠습니까?')) {
        return;
      }

      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3003/api/feed/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchPost(); // 새로고침
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  const handleReplySubmit = async (feedId, commentId) => {
    if (!newReply.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3003/api/feed/reply',
        {
          commentId,
          content: newReply,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewReply('');
      fetchPost(); // 새로고침
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
    }
  };

  const handleEditCommentSubmit = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:3003/api/feed/comment',
        {
          commentId,
          content: editedComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditCommentId(null);
      setEditedComment('');
      fetchPost(); // 새로고침
    } catch (error) {
      console.error('대댓글 수정 실패:', error);
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      if (!window.confirm('삭제하시면 복구할 수 없습니다. 정말로 삭제하시겠습니까?')) {
        return;
      }

      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3003/api/feed/reply/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchPost(); // 새로고침
    } catch (error) {
      console.error('대댓글 삭제 실패:', error);
    }
  };

  const handleLikeClick = async (feedId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3003/api/feed/${feedId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchPost(); // 새로고침
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const toggleReplyForm = (commentId) => {
    setShowReplyForm((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  if (!post) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 600,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 2,
          mx: 'auto',
          mt: '5%',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* 모달 닫기 버튼 */}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        {/* 작성자 정보 */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar src={post.profileImage} />
          <Typography variant="body1" fontWeight="bold">
            {post.username}
          </Typography>
        </Box>

        {/* 이미지 슬라이드 */}
        <Box position="relative" {...swipeHandlers}>
          {post.files?.length > 0 && (
            <img
              src={post.files[currentIndex]?.filePath}
              alt={`image-${currentIndex}`}
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          )}
          {currentIndex > 0 && (
            <IconButton
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)' }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}
          {post.files && currentIndex < post.files.length - 1 && (
            <IconButton
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)' }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}
        </Box>

        {/* 게시글 내용 */}
        <Box mt={2}>
          <Typography variant="body2">{post.content}</Typography>
        </Box>

        {/* 좋아요 및 댓글 버튼 */}
        <Box mt={2} display="flex" alignItems="center" gap={2}>
          <Typography
            component="div"
            onClick={() => handleLikeClick(postId)}
            variant="body2"
            sx={{ fontWeight: 'bold', display: 'inline', mr: 1, cursor: 'pointer' }}
          >
            <IconButton>
              <FavoriteIcon color={post.liked === 1 ? 'error' : 'inherit'} />
            </IconButton>
            좋아요 {post.likeCount || 0}개
          </Typography>

          <Button
            variant="text"
            onClick={() => setShowComments((prev) => !prev)}
            sx={{ display: 'inline-flex', alignItems: 'center', fontWeight: 'bold' }}
          >
            💬 댓글 {post.comments?.length || 0}개
          </Button>
        </Box>
        {/* 댓글 목록 */}
        {showComments && (
          <Box mt={2}>
            {post.comments?.map((comment) => (
              <Box key={comment.commentId} mb={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={comment.profileImage} />
                  <Typography variant="body2" fontWeight="bold">
                    {comment.username}
                  </Typography>
                </Box>

                {/* 댓글 내용 */}
                {editCommentId === comment.commentId ? (
                  <Box sx={{ ml: 4 }}>
                    <TextField
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      fullWidth
                      multiline
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ ml: 4 }}>
                    {comment.content}
                  </Typography>
                )}

                {/* 댓글 수정/삭제 버튼 (본인만) */}
                {comment.id === post.userId && (  // 기존 조건 유지
                  <Box mt={1} sx={{ ml: 4 }}>
                    {editCommentId !== comment.commentId ? 
                      <Button onClick={() => {
                        setEditCommentId(comment.commentId);  // 댓글 수정 상태로 변경
                        setEditedComment(comment.content);  // 수정할 내용 set

                        
                      }} sx={{ fontSize: 12 }}>
                        수정
                      </Button> 
                      
                      :

                      <Button onClick={() => handleEditCommentSubmit(comment.commentId)} sx={{ fontSize: 12 }}>
                        수정 완료
                      </Button>
                    }
                    
                    <Button onClick={() => handleDeleteComment(postId, comment.commentId)} sx={{ fontSize: 12 }}>
                      삭제
                    </Button>
                  </Box>
                )}

                {/* 대댓글 작성 버튼 및 폼 토글 */}
                <Box mt={1}>
                  <Button
                    variant="outlined"
                    onClick={() => toggleReplyForm(comment.id)}
                    sx={{ fontSize: 12 }}
                  >
                    대댓글 작성
                  </Button>

                  {showReplyForm[comment.id] && (
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
                        onClick={() => handleReplySubmit(postId, comment.id)}
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
                  <Box key={reply.commentId} mb={1} sx={{ ml: 6 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar src={reply.user?.profileImage} />
                      <Typography variant="body2" fontWeight="bold">
                        {reply.user?.username}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      {reply.content}
                    </Typography>

                    {/* 대댓글 수정/삭제 버튼 (본인만) */}
                    {reply.user?.id === post.userId && (
                      <Box mt={1} sx={{ ml: 4 }}>
                        <Button onClick={() => setEditReplyId(reply.id)} sx={{ fontSize: 12 }}>
                          수정
                        </Button>
                        <Button onClick={() => handleDeleteReply(reply.id)} sx={{ fontSize: 12 }}>
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

        {/* 댓글 작성 폼 */}
        <Box mt={2} display="flex" gap={2}>
          <TextField
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            fullWidth
            variant="outlined"
            size="small"
            multiline
            rows={2}
          />
          <Button
            onClick={() => handleCommentSubmit(postId)}
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
            disabled={loadingComment}
          >
            {loadingComment ? '작성 중...' : '작성'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}