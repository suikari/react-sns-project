import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Paper, Button } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function MyPage() {

    const navigate = useNavigate(); // 페이지 이동을 위한 함수 리턴

    let token = localStorage.getItem("token") || ''; // 로컬 스토리지에서 토큰 꺼내기
    let dToken = '';

    const [userData,setUser] = useState({userName:""});
    const [open, setOpen] = React.useState(false);
    const [imgUrl,setImgUrl] = useState();
    const [images, setImages] = useState([]);
    const [reset,setReset] = useState(false);

    const fnInfo = (dToken) => {
  
      fetch('http://localhost:3003/member/' +  dToken.userId )
        .then((res)=> res.json())
        .then((data) => {
            console.log(data);
            setUser(data.result);
        })
        .catch( err => {
        });
    }

    useEffect(()=>{
      if (token != '') {
        dToken = jwtDecode(token) // 디코딩
        fnInfo(dToken);

      }
    },[reset])
    

    
    const handleClickOpen = (message) => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const selectImg = (e) => {
      const file = e.target.files[0];
      setImages(file);

      if (file) {
        console.log(file);
        setImgUrl(URL.createObjectURL(file));
        
      }

    };


    const handleEdit = () => {

  
      const formData = new FormData();
        
      // 파일들을 FormData에 추가
      formData.append('images', images);  // input name: 'images'

      console.log("22",formData);

      fetch('http://localhost:3003/member/upload/' +  userData.email, {
        method : "POST",
        body: formData,
        })

        .then((res)=> res.json())
        .then((data) => {
            console.log(data);
            alert("수정 완료");
            handleClose();
            setReset(!reset);
        })
        .catch( err => {
        });
  
  
    }

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        minHeight="100vh"
        sx={{ padding: '20px' }}
      >
        <Paper elevation={3} sx={{ padding: '20px', borderRadius: '15px', width: '100%' }}>
          {/* 프로필 정보 상단 배치 */}
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: 3 }}>
            <Avatar
              alt="프로필 이미지"
              src={ "http://localhost:3003/"+userData.profileImg || "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e" } // 프로필 이미지 경로
              sx={{ width: 100, height: 100, marginBottom: 2 }}
              onClick={()=>{
                handleClickOpen();
              }}
            />
            <Typography variant="h5">{userData.userName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {userData.email}
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">팔로워</Typography>
              <Typography variant="body1">150</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">팔로잉</Typography>
              <Typography variant="body1">100</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">게시물</Typography>
              <Typography variant="body1">50</Typography>
            </Grid>
          </Grid>
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6">내 소개</Typography>
            <Typography variant="body1">
              {userData.intro}
            </Typography>
          </Box>
        </Paper>
        <Button onClick={()=>{
            localStorage.removeItem("token");
            alert('로그아웃 되었습니다.');
            navigate('/');
        }}>로그아웃</Button>

      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        
        <DialogTitle id="alert-dialog-title">
          {"프로필 사진 변경"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
              <label>
                <input onChange={selectImg} type="file" accept="image/*" hidden={true} onFilesChange={setImages} ></input>
                <Button variant='contained' component='span'  > 이미지 선택 </Button>
                { !imgUrl  && "선택된 파일 없음"}
                {imgUrl  && "이미지 선택됨" }
                { imgUrl  && 
                  <Box mt={2}>
                  <Typography variant='h4'>미리보기</Typography>
                    <Avatar
                    alt="프로필 이미지"
                    src={imgUrl} 
                    sx={{ width: 100, height: 100, marginBottom: 2 , marginTop : 5 }}
                    onClick={()=>{
                      handleClickOpen();
                    }}
                    
                    />
                  </Box>
                }
              </label>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
           <Button onClick={handleEdit} autoFocus>
            저장
          </Button>
          <Button onClick={()=>{
            setImgUrl();
            handleClose();
          }} >
            취소
          </Button>

        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default MyPage;