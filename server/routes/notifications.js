const express = require('express');
const notiController = require('../controllers/notificationsController');
const authMiddleware = require('../middlewares/authMiddleware');


const router = express.Router();


// 사용자 목록 API
router.get('/', authMiddleware , notiController.getNotifications);

// 알림 읽음 처리
router.post('/:id/read/', authMiddleware ,  notiController.setReadNotifications);


module.exports = router;
