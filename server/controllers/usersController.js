
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
    const user = await db.query('SELECT id, email, username, introduce, profileImage FROM tbl_users WHERE id = ?', [userId]);

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

exports.getUserId = async (req, res) => {
  const { username } = req.params;

  try {
    const [rows] = await db.query('SELECT id FROM tbl_users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ id: rows[0].id });
  } catch (err) {
    console.error('Error fetching user ID by username:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 프로필 업데이트
exports.UpdateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, intro } = req.body;
  const profileImage = req.file ? `${process.env.SERVER_URL}/uploads/${req.file.filename}` : null;

  try {
    // 먼저 기존 사용자 정보 확인
    const [users] = await db.execute('SELECT * FROM tbl_users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    // 프로필 이미지가 업로드되었을 경우에만 업데이트
    let sql = `UPDATE tbl_users SET username = ?, introduce = ?`;
    const params = [username, intro];

    if (profileImage) {
      sql += `, profileImage = ?`;
      params.push(profileImage);
    }

    sql += ` WHERE id = ?`;
    params.push(userId);

    await  db.execute(sql, params);

    res.json({ success: true, message: '프로필이 업데이트되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '프로필 업데이트 중 오류가 발생했습니다.' });
  }
};

exports.checkUsernameDuplicate = async (req, res) => {
  const { username, id } = req.body; // 현재 로그인한 사용자의 ID와 새로 입력한 username

  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM tbl_users WHERE username = ? AND id != ?',
      [username, id]
    );

    const isDuplicate = rows[0].count > 0;

    res.json({ success: true, isDuplicate });
  } catch (err) {
    console.error('중복 확인 오류:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

exports.getFollowingUsersWithStories = async (req, res) => {
  const { userId } = req.params;

  try {
    // 본인 정보
    const [selfRows] = await db.execute(
      `
      SELECT 
        u.id AS userId,
        u.username,
        u.profileImage,
        s.storyId,
        s.mediaType,
        s.mediaPath,
        s.caption,
        s.createdAt,
        MAX(s.createdAt) OVER (PARTITION BY u.id) AS latestStoryTime,
        CASE WHEN v.viewerId IS NOT NULL THEN TRUE ELSE FALSE END AS viewed
      FROM tbl_users u
      LEFT JOIN tbl_story s 
        ON s.userId = u.id 
        AND s.createdAt >= NOW() - INTERVAL 1 DAY
      LEFT JOIN tbl_story_view v
        ON v.storyId = s.storyId AND v.viewerId = ?
      WHERE u.id = ? AND u.deleteYn = 'N'
      ORDER BY IFNULL(latestStoryTime, 0) DESC
      `,
      [userId, userId]
    );

    // 팔로우 유저 정보
    const [rows] = await db.execute(
      `
      SELECT 
        u.id AS userId,
        u.username,
        u.profileImage,
        s.storyId,
        s.mediaType,
        s.mediaPath,
        s.caption,
        s.createdAt,
        MAX(s.createdAt) OVER (PARTITION BY u.id) AS latestStoryTime,
        CASE WHEN v.viewerId IS NOT NULL THEN TRUE ELSE FALSE END AS viewed
      FROM tbl_follow f
      JOIN tbl_users u ON f.followedId = u.id
      INNER JOIN tbl_story s 
        ON s.userId = u.id 
        AND s.createdAt >= NOW() - INTERVAL 1 DAY
      LEFT JOIN tbl_story_view v
        ON v.storyId = s.storyId AND v.viewerId = ?
      WHERE f.followerId = ? AND u.deleteYn = 'N'
      ORDER BY IFNULL(latestStoryTime, 0) DESC
      `,
      [userId, userId]
    );

    const mapUserStories = (rows) => {
      const result = [];
      const userMap = {};

      rows.forEach(row => {
        if (!userMap[row.userId]) {
          userMap[row.userId] = {
            userId: row.userId,
            username: row.username,
            profileImage: row.profileImage,
            stories: [],
          };
          result.push(userMap[row.userId]);
        }

        if (row.storyId) {
          userMap[row.userId].stories.push({
            storyId: row.storyId,
            mediaType: row.mediaType,
            mediaPath: row.mediaPath,
            caption: row.caption,
            createdAt: row.createdAt,
            viewed: !!row.viewed,
          });
        }
      });

      return result;
    };

    const selfData = mapUserStories(selfRows);
    const followingData = mapUserStories(rows);

    const result = [...selfData, ...followingData];
    res.json(result);
  } catch (err) {
    console.error('팔로잉 유저 + 본인 스토리 조회 실패:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

exports.getRandomFriend = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    // 1. 관계 기반 추천
    const [relBased] = await db.query(`
      SELECT DISTINCT u.id, u.username, u.profileImage
      FROM tbl_follow f
      JOIN tbl_follow f2 ON f.followedId = f2.followerId
      JOIN tbl_users u ON u.id = f2.followedId
      WHERE f.followerId = ?
        AND u.id != ?
        AND u.id NOT IN (
          SELECT followedId FROM tbl_follow WHERE followerId = ?
        )
      LIMIT 5
    `, [currentUserId, currentUserId, currentUserId]);

    let recommendations = [...relBased];

    // 🔸 추가: 현재 유저가 팔로우한 ID들 가져오기
    const [followedRows] = await db.query(`
      SELECT followedId FROM tbl_follow WHERE followerId = ?
    `, [currentUserId]);
    const followedIds = followedRows.map(row => row.followedId);

    // 🔸 제외할 ID들
    const excludeIds = [currentUserId, ...recommendations.map(r => r.id), ...followedIds];
    const placeholders = excludeIds.map(() => '?').join(',');

    // 2. 보충 필요 시 무작위 유저 추천
    if (recommendations.length < 5) {
      const [[{ totalUsers }]] = await db.query(`
        SELECT COUNT(*) AS totalUsers
        FROM tbl_users
        WHERE id NOT IN (${placeholders})
      `, excludeIds);

      const remaining = 5 - recommendations.length;
      const maxOffset = Math.max(totalUsers - remaining, 0);
      const randomOffset = Math.floor(Math.random() * (maxOffset + 1));

      const [randomUsers] = await db.query(`
        SELECT id, username, profileImage
        FROM tbl_users
        WHERE id NOT IN (${placeholders})
        LIMIT ? OFFSET ?
      `, [...excludeIds, remaining, randomOffset]);

      recommendations = [...recommendations, ...randomUsers];
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('추천 친구 오류:', error);
    res.status(500).json({ message: '추천 실패' });
  }
};
