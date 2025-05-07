const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.get('/me', authMiddleware, async (req, res) => {
    const userId = req.user.id;
  
    // DB에서 사용자 정보 조회
    const [rows] = await db.query('SELECT id, email, username, profile_image FROM tbl_users WHERE id = ?', [userId]);
  
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
  
    res.json({ success: true, user: rows[0] });
  });

router.post('/signup', upload.single('profileImage'), authController.signup);

router.post('/send-verification', authController.sendVerification);
router.post('/verify-code', authController.verifyCode);

router.post('/login', authController.login);
router.post('/social', authController.socialLogin);

module.exports = router;

