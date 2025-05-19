const db = require('../models/db'); // DB 연결
require('dotenv').config();

// 현재 로그인 유저의 알림 조회
exports.getNotifications = async (req, res) => {
  const userId = req.user.id;
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const offset = (page - 1) * limit;

  try {
    const [rows] = await db.query(
      `SELECT * FROM tbl_notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};
  
  // 알림 읽음 처리
  exports.setReadNotifications  = async (req, res) => {
    const id = req.params.id;
    await db.query('UPDATE tbl_notifications SET isRead = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  };
  