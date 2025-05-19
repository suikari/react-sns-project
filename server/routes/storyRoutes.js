const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const authMiddleware = require('../middlewares/authMiddleware');

const upload = require('../middlewares/upload'); 


// 스토리 업로드 (파일 + 설명)
router.post('/', authMiddleware, upload.single('file'), storyController.createStories);

// 전체 스토리 목록 불러오기 (24시간 이내)
router.get('/', authMiddleware, storyController.getStories);

// 스토리 조회 기록 저장
router.post('/view/:storyId', authMiddleware, storyController.stroiesView);

// 내가 올린 스토리
router.get('/my', authMiddleware, storyController.getMyStories);

// 팔로우한 사람들의 스토리
router.get('/followed', authMiddleware, storyController.getFollowedStories);

// 스토리 수정
router.put('/', authMiddleware, storyController.updateStory);

// 스토리 삭제
router.delete('/:storyId', authMiddleware, storyController.deleteStory);

// 스토리 조회자 목록
router.get('/view/:storyId', authMiddleware, storyController.getViewers);

module.exports = router;