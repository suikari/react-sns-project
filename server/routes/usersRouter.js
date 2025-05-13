// usersRouter.js

const express = require('express');
const userController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); 

const router = express.Router();

// 사용자 목록 API
router.get('/', userController.searchUsers);

// 내가 팔로우한 사용자 조회
router.get('/following/:userId', authMiddleware, userController.getFollowingUsers);
router.get('/:userId', userController.getUserInfo);
router.post('/:userId/follow', authMiddleware , userController.followUser);
router.delete('/:userId/unfollow', authMiddleware , userController.unfollowUser);
router.get('/follow/info/:userId', userController.getFollowInfo);
router.get('/search/:keyword',authMiddleware,userController.getUserSearch);

router.get('/getUserId/:username',userController.getUserId);

router.put('/:id/profile', authMiddleware , upload.single('profileImage'), userController.UpdateUser);


module.exports = router;
