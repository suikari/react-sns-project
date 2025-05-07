const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// 피드 작성 (업로드 포함)
router.post('/', authMiddleware, upload.array('files'), feedController.createPost);

// 피드 전체 조회
router.get('/', authMiddleware, feedController.getAllPosts);

// 댓글 작성
router.post('/comment', authMiddleware, feedController.addComment);

// 좋아요 토글
router.post('/:postId/like', authMiddleware, feedController.toggleLike);

module.exports = router;

