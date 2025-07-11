import { useParams , useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, Box, Tabs, Tab, Typography , Button , Modal } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import FeedDetailModal from './FeedDetailModal'; // 경로 확인
import { Flag } from '@mui/icons-material';
import ProfileEditModal from './ProfileEditModal'; // 추가
import StoryGallery from '../components/StoryGallery'; // 추가
import StoryViewModal from '../components/StoryViewModal';

export default function UserPage() {
  const params = useParams();
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userImage, setUserImage] = useState(null);

  const [currentId, setCurrentId] = useState(null);
  const [user, setUser] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [stories, setStories] = useState([]);

  const [isFollowing, setIsFollowing] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);

  const [value, setValue] = useState(0); // 탭 상태 관리
  const [isflag, setFlag] = useState(false); // 탭 상태 관리

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [openStoryModal, setStoryOpenModal] = useState(false);
  const [selectedStoryUser, setSelectedStoryUser] = useState(null);

  const navigate = useNavigate(); // 페이지 이동을 위한 함수 리턴

  
  const handleOpenModal = (title, data) => {
    setModalTitle(title);
    setModalData(data);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const [followInfo, setFollowInfo] = useState({
    followers: [],
    following: [],
    mutuals: [],
  });

  // 추가
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModalWithPostId = (postId) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
    };

  useEffect(() => {
    if (params.userId) {
      setUserId(params.userId);
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      }
    }

    const ctoken = localStorage.getItem('token');
    if (ctoken) {
      const cdecoded = jwtDecode(ctoken);
      setCurrentId(cdecoded.id);
    }
   

  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const token = localStorage.getItem('token') || '';

      if (token == '') {
        navigate('/login');
      }

      const [userRes, followRes, myfeed, mycomment, mylikelist, myStories ] = await Promise.all([
        axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}`),
        axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/users/follow/info/${userId}`),
        axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed?filter=my&userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed/comment/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/feed/like/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/api/story/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUser(userRes.data[0]);
      setUserName(userRes.data[0].username);
      setUserImage(userRes.data[0].profileImage);

      setFollowInfo(followRes.data);
      setFeeds(myfeed.data);
      setComments(mycomment.data);
      setLikes(mylikelist.data);
      setStories(myStories.data);

      if (followRes.data.followers && Array.isArray(followRes.data.followers)) {
        const isUserFollowing = followRes.data.followers.some((follower) => follower.id === currentId);
        setIsFollowing(isUserFollowing);
      }

      console.log(followRes.data);
    };

    fetchData();
  }, [userId , isflag]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue); // 탭 클릭 시 value 상태 업데이트
  };
 
  
  const handleFollow = async (userId) => {
    const token = localStorage.getItem('token') || '';

    try {
      await axios.post(`http://${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(true);
      setFlag(!isflag);
    } catch (err) {
      console.error('팔로우 실패', err);
    }
  };
  
  const handleFlag = async => {
    setFlag(!isflag);
  }

  const handleUnfollow = async (userId) => {
    const token = localStorage.getItem('token') || '';

    try {
      await axios.delete(`http://${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/unfollow`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(false);
      setFlag(!isflag);
    } catch (err) {
      console.error('언팔로우 실패', err);
    }
  };

  const handleStoryOpenModalWithStoryId = (storyId) => {
    const story = stories.find((s) => s.storyId === storyId);
    if (!story) return;

    setSelectedStoryUser({
      username: userName, // 실제로 유저 이름이 필요하다면 수정
      profileImage: userImage, // 프로필 이미지도 필요하면 추가
      stories: [story], // 단일 스토리만 배열로 넘김
    });

    setStoryOpenModal(true);
  };

  const handleStoryCloseModal = () => {
    setStoryOpenModal(false);
    setSelectedStoryUser(null);
  };

  
  if (!userId || !user) return <div>Loading...</div>;

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar src={user.profileImage} sx={{ width: 64, height: 64 }} />
        <Box flexGrow={1}>
          <Typography variant="h6" fontWeight="bold">{user.username}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>

            {/* 자기소개 */}
            {user.introduce && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary', 
                  mt: 0.5, 
                  fontStyle: 'italic',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {user.introduce}
              </Typography>
            )}
            
        </Box>

        {/* 본인 페이지가 아닌 경우에만 버튼 노출 */}
          {currentId === user.id ? (
            <Button variant="outlined" onClick={() => setIsProfileModalOpen(true)}>
              프로필 수정
            </Button>
          ) : (
            isFollowing ? (
              <Button variant="outlined" color="secondary" onClick={() => handleUnfollow(user.id)}>
                언팔로우
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={() => handleFollow(user.id)}>
                팔로우
              </Button>
            )
          )}
      </Box>

      <Box mt={2} display="flex" justifyContent="space-between">
        <Box onClick={() => handleOpenModal("팔로워", followInfo.followers)} sx={{ cursor: "pointer" }}>
          <Typography variant="body2" fontWeight="bold">팔로워</Typography>
          <Typography variant="h6">{followInfo.followers.length}</Typography>
        </Box>
        <Box onClick={() => handleOpenModal("팔로잉", followInfo.following)} sx={{ cursor: "pointer" }}>
          <Typography variant="body2" fontWeight="bold">팔로잉</Typography>
          <Typography variant="h6">{followInfo.following.length}</Typography>
        </Box>
        <Box onClick={() => handleOpenModal("친구", followInfo.mutuals)} sx={{ cursor: "pointer" }}>
          <Typography variant="body2" fontWeight="bold">친구</Typography>
          <Typography variant="h6">{followInfo.mutuals.length}</Typography>
        </Box>
      </Box>

      <Box p={3}>
      <Tabs value={value} onChange={handleTabChange}>
        <Tab label="피드" />
        <Tab label="댓글" />
        <Tab label="좋아요" />
          {currentId === user.id ? (
            <Tab label="스토리" />
          ) : null }
      </Tabs>

      {value === 0 && (
        <>
            <Typography component={"div"} variant="h6" mt={3}>피드 콘텐츠</Typography>

            <Box mt={3} display="flex" flexWrap="wrap" gap={2}>
            {feeds.map((feed, index) => (
            <Box
                key={index}
                onClick={() => openModalWithPostId(feed.postId)}
                position="relative"
                width="calc(25% - 16px)"
                height="200px"
                sx={{
                transition: 'all 0.3s ease',
                '&:hover img': {
                    opacity: 0.7, // 호버 시 이미지의 투명도 높아짐
                },
                '&:hover .feed-content': {
                    opacity: 1, // 호버 시 게시글 내용 보이게 함
                }
                }}
            >
                <img
                src={ feed.files?.[0]?.filePath || `http://${process.env.REACT_APP_API_BASE_URL}/uploads/noimage.jpg`}
                alt={ feed.title }
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    transition: 'opacity 0.3s ease',
                }}
                />
                <Box
                className="feed-content"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    opacity: 0, // 기본 상태에서 게시글 내용 숨기기
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px',
                    borderRadius: '8px',
                    transition: 'opacity 0.3s ease',
                }}
                >
                <Typography variant="body2" align="center">{feed.content}</Typography>
                </Box>
            </Box>
            ))}
            </Box>
        </>

        
      )}
      {value === 1 && (
        <>
            <Typography variant="h6" mt={3}>댓글 콘텐츠</Typography>
            <Box mt={3}>
                {comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">작성한 댓글이 없습니다.</Typography>
                ) : (
                <Box  display="flex" flexDirection="column" gap={2}>
                    {comments.map((comment) => (
                    <Box 
                    key={comment.commentId} display="flex" alignItems="center" 
                    gap={2} p={1} 
                    borderBottom="1px solid #eee"
                    onClick={() => openModalWithPostId(comment.postId)}
                    >

                        <Avatar src={comment.profileImage} alt={comment.username} />
                        <Box>
                        <Typography variant="body2" fontWeight="bold">{comment.username}</Typography>
                        <Typography variant="body2">{comment.content}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                        </Box>
                    </Box>
                    ))}
                </Box>
                )}
            </Box>
        </>
      )}
      {value === 2 && (
            <>
            <Typography component="div" variant="h6" mt={3}>
              좋아요 피드 목록
            </Typography>
      
            <Box mt={3} display="flex" flexWrap="wrap" gap={2}>
              {likes.map((feed, index) => (
                <Box
                  key={index}
                  onClick={() => openModalWithPostId(feed.postId)}
                  position="relative"
                  width="calc(25% - 16px)"
                  height="200px"
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover img': {
                      opacity: 0.7,
                    },
                    '&:hover .feed-content': {
                      opacity: 1,
                    },
                  }}
                >
                  <img
                    src={feed.thumbnail || `http://${process.env.REACT_APP_API_BASE_URL}/uploads/noimage.jpg` }
                    alt={feed.content}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                  <Box
                    className="feed-content"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      opacity: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '10px',
                      borderRadius: '8px',
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <Typography variant="body2" align="center">
                      {feed.content}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
      )}
      {value === 3 && (
          <StoryGallery
            stories={stories}  // storyList는 위에 JSON 구조
            openModalWithStoryId={handleStoryOpenModalWithStoryId} // 클릭 시 처리
          />
      )}

    </Box>


    <FeedDetailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        postId={selectedPostId}
    />

    <ProfileEditModal
      open={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      user={user}
      onUpdate={handleFlag}
    />


    <Modal open={openModal} onClose={handleCloseModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 2,
          maxHeight: 400,
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" mb={2} fontWeight="bold">
          {modalTitle}
        </Typography>
        {modalData.map((u) => (
          <Box
            key={u.id}
            display="flex"
            alignItems="center"
            mb={1}
            sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5", borderRadius: 1, p: 1 } }}
            onClick={() => {
              handleCloseModal();
              navigate(`/userpage/${u.id}`);
            }}
          >
            <Avatar src={u.profileImage} alt={u.username} sx={{ mr: 1 }} />
            <Typography variant="body1">{u.username}</Typography>
          </Box>
        ))}
      </Box>
    </Modal>

      <StoryViewModal
        open={openStoryModal}                 
        handleClose={handleStoryCloseModal} 
        user={selectedStoryUser}            
      />

    </Box>
  );
}
