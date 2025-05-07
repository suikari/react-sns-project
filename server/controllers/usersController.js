
const db = require('../models/db'); // DB 연결
require('dotenv').config();


// 사용자 목록 조회
exports.searchUsers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username FROM tbl_users WHERE deleteYn = "N"');
    res.json(rows); // 사용자 목록 반환
  } catch (err) {
    console.error('사용자 목록 조회 실패:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};