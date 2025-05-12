const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/rooms', authMiddleware, chatController.createRoom);
router.get('/rooms', authMiddleware, chatController.getRooms);
router.get('/rooms/:roomId/messages', authMiddleware, chatController.getMessages);
router.post('/direct', authMiddleware, chatController.openDirectChat);
router.post('/group', authMiddleware, chatController.createOrGetGroupChatRoom);


module.exports = router;
