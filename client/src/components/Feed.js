import React, { useState , useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { Autoplay, EffectCoverflow } from 'swiper/modules';

import {
  Grid2,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


function Feed() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');


  const [mockFeeds, setFeeds] = useState([]);



  let fnList = (userId) => {
    
    let url;
  
    if (userId != '' ) {
      url = "http://localhost:3003/feed?userId="+ userId
    } else {
      url = "http://localhost:3003/feed";
    }
  
    fetch(url)
        .then((res)=> res.json())
        .then(data => {
            console.log(data);
            if (data.message == 'success' ) {
                //alert(data.result+'님 환영합니다.');
                //location.href = "../day3/product-list.html";
                console.log(data);
                setFeeds(data.list);
            } else {
            }
        })
        .catch( err => {
        });
    }
  
    let fnCmtList = (feedId) => {
    
      let url;
    

      url = "http://localhost:3003/feed/comment/"+ feedId ;
      
    
      fetch(url)
          .then((res)=> res.json())
          .then(data => {
              console.log(data);
              if (data.message == 'success' ) {
                  //alert(data.result+'님 환영합니다.');
                  //location.href = "../day3/product-list.html";
                  console.log("test",data);
                  setComments(data.list);
                  //setFeeds(data.list);
              } else {
              }
          })
          .catch( err => {
          });
    }

  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    fnCmtList(feed.feedId);

    setNewComment(''); // 댓글 입력 초기화
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]); // 모달 닫을 때 댓글 초기화
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { userId: 'currentUser', content: newComment }]); // 댓글 작성자 아이디 추가
      setNewComment('');
    }
  };

  useEffect (()=>{
      fnList('');
   }
   ,[])

  return (
    <Container maxWidth="md">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">SNS</Typography>
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Grid2 container spacing={3}>
          {mockFeeds.map((feed) => (
            <Grid2 xs={12} sm={6} md={4} key={feed.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={ feed.images ? "http://localhost:3003/" + feed.images[0].imgPath : null }
                  alt={feed.title}
                  onClick={() => handleClickOpen(feed)}
                  style={{ cursor: 'pointer' }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    {feed.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg"> {/* 모달 크기 조정 */}
        <DialogTitle>
          {selectedFeed?.title}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex' }}>
          <Swiper
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1}
            loop={true}
            modules={[Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
          >
            {selectedFeed?.images && selectedFeed.images.map((item, index) => (
              <SwiperSlide key={index}>
                <img
                  src={`http://localhost:3003/${item.imgPath}`}
                  alt={item.imgName}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginTop: '10px'
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <Box sx={{  }}>
            <Typography variant="body1">{selectedFeed?.content}</Typography>
          </Box>
          {/* mui는 >> inputRef={useRef} <<  */}
          <Box sx={{ width: '300px', marginLeft: '20px' }}>
            <Typography variant="h6">댓글</Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>{comment.userId.charAt(0).toUpperCase()}</Avatar> {/* 아이디의 첫 글자를 아바타로 표시 */}
                  </ListItemAvatar>
                  <ListItemText primary={comment.content} secondary={comment.userId} /> {/* 아이디 표시 */}
                </ListItem>
              ))}
            </List>
            <TextField
              label="댓글을 입력하세요"
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}           
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              sx={{ marginTop: 1 }}
            >
              댓글 추가
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Feed;