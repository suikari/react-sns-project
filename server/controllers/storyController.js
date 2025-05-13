const db = require('../models/db'); // DB 연결
require('dotenv').config();

exports.createStories = async (req, res) => {
    const userId = req.user.id;
    const { caption } = req.body;
    const mediaPath = `${process.env.SERVER_URL}/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
  
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후
  
    await db.execute(
      `INSERT INTO tbl_story (userId, mediaType, mediaPath, caption, expiresAt) VALUES (?, ?, ?, ?, ?)`,
      [userId, mediaType, mediaPath, caption, expiresAt]
    );
  
    res.json({ message: '스토리 업로드 완료' });
  };


  exports.getStories = async (req, res) => {
    const currentUserId = req.user.id;
  
    const [rows] = await db.execute(`
      SELECT s.storyId, s.userId, s.mediaType, s.mediaPath, s.caption, s.createdAt,
             u.username, u.profileImage,
             EXISTS (SELECT 1 FROM tbl_story_view WHERE storyId = s.storyId AND viewerId = ?) AS viewed
      FROM tbl_story s
      JOIN tbl_users u ON s.userId = u.id
      WHERE s.expiresAt > NOW()
      ORDER BY s.createdAt DESC
    `, [currentUserId]);
  
    res.json(rows);
  };

  exports.stroiesView = async (req, res) => {
    const viewerId = req.user.id;
    const { storyId } = req.params;
  
    await db.execute(`
      INSERT IGNORE INTO tbl_story_view (storyId, viewerId) VALUES (?, ?)
    `, [storyId, viewerId]);
  
    res.json({ message: '조회 기록 저장됨' });
  };


  exports.getMyStories = async (req, res) => {
    const userId = req.user.id;
    try {
      const [stories] = await db.query(
        'SELECT * FROM tbl_story WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
      res.json(stories);
    } catch (err) {
      res.status(500).json({ error: '내 스토리 조회 실패' });
    }
  };
  
  exports.getFollowedStories = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const [stories] = await db.query(
        `
        SELECT s.*, u.username, u.profileImage
        FROM tbl_story s
        JOIN tbl_users u ON s.userId = u.id
        JOIN tbl_follow f ON f.followedId = s.userId
        WHERE f.followerId = ?
          AND s.createdAt >= NOW() - INTERVAL 1 DAY
        ORDER BY s.createdAt DESC
        `,
        [userId]
      );
  
      res.json(stories);
    } catch (err) {
      console.error('팔로우한 스토리 조회 실패:', err);
      res.status(500).json({ error: '팔로우한 친구의 스토리 조회 실패' });
    }
  };
  
  exports.uploadStory = async (req, res) => {
    const userId = req.user.id;
    const { caption } = req.body;
    const file = req.file;
  
    if (!file) return res.status(400).json({ error: '파일이 없습니다' });
  
    const mediaPath = `/uploads/${file.filename}`;
    const mediaType = file.mimetype.startsWith('video') ? 'video' : 'image';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후
  
    try {
      await db.query(
        'INSERT INTO tbl_story (userId, mediaType, mediaPath, caption, expiresAt) VALUES (?, ?, ?, ?, ?)',
        [userId, mediaType, mediaPath, caption, expiresAt]
      );
      res.json({ message: '스토리 업로드 성공' });
    } catch (err) {
      res.status(500).json({ error: '스토리 업로드 실패' });
    }
  };
  
  exports.updateStory = async (req, res) => {
    const userId = req.user.id;
    const { storyId, caption } = req.body;
  
    try {
      const [result] = await db.query(
        'UPDATE tbl_story SET caption = ? WHERE storyId = ? AND userId = ?',
        [caption, storyId, userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '수정 권한이 없거나 존재하지 않는 스토리' });
      }
      res.json({ message: '스토리 수정 성공' });
    } catch (err) {
      res.status(500).json({ error: '스토리 수정 실패' });
    }
  };
  
  exports.deleteStory = async (req, res) => {
    const userId = req.user.id;
    const { storyId } = req.params;
  
    try {
      const [[story]] = await db.query(
        'SELECT mediaPath FROM tbl_story WHERE storyId = ? AND userId = ?',
        [storyId, userId]
      );
  
      if (!story) return res.status(404).json({ error: '삭제 권한이 없거나 존재하지 않음' });
  
      await db.query('DELETE FROM tbl_story WHERE storyId = ? AND userId = ?', [storyId, userId]);
  
      // 로컬 이미지 삭제
      const filePath = path.join(__dirname, '..', 'public', story.mediaPath);
      fs.unlink(filePath, (err) => {
        if (err) console.error('파일 삭제 실패:', err);
      });
  
      res.json({ message: '스토리 삭제 성공' });
    } catch (err) {
      res.status(500).json({ error: '스토리 삭제 실패' });
    }
  };
  
  exports.viewStory = async (req, res) => {
    const viewerId = req.user.id;
    const { storyId } = req.params;
  
    try {
      await db.query(`
        INSERT IGNORE INTO tbl_story_view (storyId, viewerId)
        VALUES (?, ?)`,
        [storyId, viewerId]
      );
      res.json({ message: '조회 기록 저장됨' });
    } catch (err) {
      res.status(500).json({ error: '스토리 조회 기록 실패' });
    }
  };
  
  exports.getViewers = async (req, res) => {
    const userId = req.user.id;
    const { storyId } = req.params;
  
    try {
      const [[story]] = await db.query('SELECT userId FROM tbl_story WHERE storyId = ?', [storyId]);
      if (!story || story.userId !== userId) {
        return res.status(403).json({ error: '조회 권한 없음' });
      }
  
      const [viewers] = await db.query(`
        SELECT u.id, u.username, u.profileImage, v.viewedAt
        FROM tbl_story_view v
        JOIN tbl_users u ON v.viewerId = u.id
        WHERE v.storyId = ?
        ORDER BY v.viewedAt DESC
      `, [storyId]);
  
      res.json(viewers);
    } catch (err) {
      res.status(500).json({ error: '조회자 목록 조회 실패' });
    }
  };