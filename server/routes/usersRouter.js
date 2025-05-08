// usersRouter.js

const express = require('express');
const userController = require('../controllers/usersController');

const router = express.Router();

// 사용자 목록 API
router.get('/', userController.searchUsers);

router.get('/:userId', userController.getUserInfo);
router.post('/:userId/follow', userController.followUser);
router.delete('/:userId/unfollow', userController.unfollowUser);
router.get('/follow/info/:userId', userController.getFollowInfo);


module.exports = router;
