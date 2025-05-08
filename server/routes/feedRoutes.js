const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// 피드 작성 (업로드 포함)
router.post('/', authMiddleware, upload.array('files'), feedController.createPost);

// 피드 전체 조회
router.get('/', authMiddleware, feedController.getAllPosts);

// 하나 조회
router.get('/:postId', authMiddleware, feedController.getPostById);



// 좋아요 토글
router.post('/:postId/like', authMiddleware, feedController.toggleLike);

// 댓글 작성
router.post('/comment', authMiddleware, feedController.addComment);

// 댓글 수정
router.put('/comment', authMiddleware, feedController.updateComment);

// 댓글 삭제
router.delete('/comment/:commentId', authMiddleware, feedController.deleteComment);

// 댓글 목록 조회
router.get('/comment/:userId', authMiddleware, feedController.getUserComments);


module.exports = router;

