// usersRouter.js

const express = require('express');
const userController = require('../controllers/usersController');

const router = express.Router();

// 사용자 목록 API
router.get('/', userController.searchUsers);

module.exports = router;
