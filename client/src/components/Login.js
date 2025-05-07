import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import TextField from '@mui/material/TextField';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useState } from 'react';


import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useNavigate , Link } from 'react-router-dom';



function LoginPage() {



  const navigate = useNavigate(); // 페이지 이동을 위한 함수 리턴
  

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = (message) => {
    userId = message;
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    navigate("/");     
  };

    let [info,setInfo] = useState({userId : "", pwd : "" });
    let userId = '';
    let fnLogin =  () => {
      fetch('http://localhost:3003/member', {
          method : "POST",
          headers : {
              "Content-type" : "application/json",
          },
          credentials : "include",
          body : JSON.stringify(info),
      })
          .then((res)=> res.json())
          .then((data) => {
              console.log(data);
              if (data.message == 'success' ) {
                  //alert(data.result+'님 환영합니다.');
                  //location.href = "../day3/product-list.html";
                  

                  handleClickOpen(data.result);
                  localStorage.setItem("token", data.token);

              } else {
                  alert('아이디 또는 패스워드를 확인하세요.');
              }
          })
          .catch( err => {
              alert('아이디 또는 패스워드를 확인하세요.');
          });
  }

  return (

    
    <Box sx={{ height: '100vh' }}>
      
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"로그인을 환영합니다."}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {userId} 로그인 환영합니다
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* title */}
        <Box sx={{ marginY: '5rem' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/320px-Instagram_logo.svg.png"
            alt="logo"
            width={'100%'}
          />
          <Typography align="center">MUI 인스타그램</Typography>
        </Box>
        

        
        <Box
          sx={{
            width: '100%',
            maxWidth: '360px',
            '> button + button': { marginTop: '0.25rem' },
          }}
        >

          <div>
            <TextField value={info.userId} fullWidth id="ID" label="ID" variant="outlined"
             style={{ marginBottom : '10px'}} onChange={(e)=>{
                let userId =  e.target.value;
                
                setInfo({  userId  , pwd : info.pwd })
             }} />
          </div>
          <div>
            <TextField value={info.pwd}  type="password" fullWidth id="PWD" label="PWD" 
            variant="outlined" onChange={(e)=>{
              let pwd =  e.target.value;
              
              setInfo({  userId : info.userId  , pwd : pwd })
              console.log(info);
           }} />
          </div>

          <br/>
          <Button
            fullWidth
            sx={{
              color: '#333333',
              backgroundColor: '#ffffff',
              border: '1px solid #bdbdbd',
              // borderColor: '#000000',
              '&:hover': {
                backgroundColor: '#dddddd',
              },
              marginBottom:'20px',
            }}
            onClick={()=>{
              fnLogin();
            }}
          >
            로그인
          </Button>
          
          <Button
            fullWidth
            startIcon={
              <img
                src="https://developers.google.com/static/identity/images/g-logo.png"
                alt="google login"
                width={20}
                height={20}
              />
            }
            sx={{
              color: '#333333',
              backgroundColor: '#ffffff',
              border: '1px solid #bdbdbd',
              // borderColor: '#000000',
              '&:hover': {
                backgroundColor: '#eeeeee',
              },
            }}
          >
            구글 로그인
          </Button>
          <Button
    fullWidth
    startIcon={<FacebookIcon />}
    sx={{
      backgroundColor: '#4267b2',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#4267b2dd',
      },
    }}
  >
    페이스북 로그인
  </Button>

  <Button
          fullWidth
          startIcon={<AppleIcon />}
          sx={{
            color: '#ffffff',
            backgroundColor: '#000000',
            '&:hover': {
              backgroundColor: '#000000bb',
            },
          }}
        >
          애플 로그인
  </Button> 
        </Box>
        <Typography variant="body2" style={{ marginTop: '10px' }}>
          회원아니셈 ? <Link to="/join">회원가입</Link>
        </Typography>

      </Container>
    </Box>
  );
}
export default LoginPage;
