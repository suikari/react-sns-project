
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

// 특정 유저 정보 조회 (마이페이지)
exports.getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.query('SELECT id, email, username, profileImage FROM tbl_users WHERE id = ?', [userId]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 특정 사용자가 팔로우한 사용자 목록 조회
exports.getFollowingUsers = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.username, u.profileImage
       FROM tbl_follow f
       JOIN tbl_users u ON f.followedId = u.id
       WHERE f.followerId = ? AND u.deleteYn = 'N'`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('팔로잉 유저 조회 실패:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 팔로우 기능
exports.followUser = async (req, res) => {
  const currentUserId = req.user.id; // JWT에서 가져온 현재 유저 ID
  const { userId } = req.params;

  if (currentUserId === userId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    await db.query('INSERT INTO tbl_follow (followerId, followedId) VALUES (?, ?)', [currentUserId, userId]);
    res.status(200).json({ message: 'Followed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 언팔로우 기능
exports.unfollowUser = async (req, res) => {
  const currentUserId = req.user.id; // JWT에서 가져온 현재 유저 ID
  const { userId } = req.params;

  try {
    await db.query('DELETE FROM tbl_follow WHERE followerId = ? AND followedId = ?', [currentUserId, userId]);
    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFollowInfo = async (req, res) => {
  const { userId } = req.params;

  try {
    // 내가 팔로우한 사람 목록 (팔로잉)
    const [following] = await db.query(`
      SELECT u.id, u.username, u.profileImage
      FROM tbl_follow f
      JOIN tbl_users u ON f.followedId = u.id
      WHERE f.followerId = ?
    `, [userId]);

    // 나를 팔로우한 사람 목록 (팔로워)
    const [followers] = await db.query(`
      SELECT u.id, u.username, u.profileImage
      FROM tbl_follow f
      JOIN tbl_users u ON f.followerId = u.id
      WHERE f.followedId = ?
    `, [userId]);

    // 서로 팔로우한 사람 목록 (맞팔)
    const [mutuals] = await db.query(`
      SELECT u.id, u.username, u.profileImage
      FROM tbl_follow f1
      JOIN tbl_follow f2 ON f1.followedId = f2.followerId AND f1.followerId = f2.followedId
      JOIN tbl_users u ON u.id = f1.followedId
      WHERE f1.followerId = ?
    `, [userId]);

    res.json({ following, followers, mutuals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};

exports.getUserSearch = async (req, res) => {
  const currentUserId = req.user.id; // JWT 등으로 인증된 사용자 ID
  const { keyword } = req.params;

  try {
    const [users] = await db.execute(`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.profileImage,
        u.createdAt,
        CASE 
          WHEN f.followerId IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END AS isFollowed
      FROM tbl_users u
      LEFT JOIN tbl_follow f 
        ON u.id = f.followedId AND f.followerId = ?
      WHERE u.username like '%${keyword}%'
    `, [currentUserId]);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};