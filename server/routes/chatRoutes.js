const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.post('/rooms', authMiddleware, chatController.createRoom);
router.get('/rooms', authMiddleware, chatController.getRooms);
router.get('/rooms/:roomId/messages', authMiddleware, chatController.getMessages);
router.post('/direct', authMiddleware, chatController.openDirectChat);
router.post('/group', authMiddleware, chatController.createOrGetGroupChatRoom);


// 메시지 읽음 처리
router.post('/messages/read', authMiddleware, chatController.readMessage);
// 메시지 삭제
router.delete('/messages/:messageId', authMiddleware, chatController.deleteMessage);

// 파일 업로드
router.post('/messages/upload', upload.single('file'), chatController.fileUpload );


module.exports = router;
