const express = require('express');
const router = express.Router();
const db = require('../db');

// 현재 로그인 유저의 알림 조회
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const [rows] = await db.query(
    `SELECT * FROM tbl_notifications WHERE userId = ? ORDER BY createdAt DESC`,
    [userId]
  );
  res.json(rows);
});

// 알림 읽음 처리
router.post('/read/:id', async (req, res) => {
  const id = req.params.id;
  await db.query('UPDATE tbl_notifications SET isRead = true WHERE id = ?', [id]);
  res.json({ success: true });
});

module.exports = router;
