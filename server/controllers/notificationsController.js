const db = require('../models/db'); // DB 연결
require('dotenv').config();

// 현재 로그인 유저의 알림 조회
exports.getNotifications = async (req, res) => {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT * FROM tbl_notifications WHERE userId = ? ORDER BY createdAt DESC`,
      [userId]
    );
    res.json(rows);
  };
  
  // 알림 읽음 처리
  exports.setReadNotifications  = async (req, res) => {
    const id = req.params.id;
    await db.query('UPDATE tbl_notifications SET isRead = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  };
  