const db = require('../models/db'); // DB 연결
require('dotenv').config();


// 멘션 파싱 함수: @123 => [123, 456]
function extractMentionedUserIds(content) {
    const matches = content.match(/@(\d+)/g);
    return matches ? matches.map(m => m.replace('@', '')) : [];
  }


exports.createPost = async (req, res) => {
    const { content, location, hashtags, deletedFiles } = req.body;
    const files = req.files;
    const userId = req.user.id;
    const userName = req.user.userName;

    
    try {
      // 1. 피드 등록
      const [postResult] = await db.execute(
        'INSERT INTO tbl_post (userId, content, location) VALUES (?, ?, ?)',
        [userId, content, location]
      );
      const postId = postResult.insertId;
  
      // 2. 파일 업로드 처리
      if (files && files.length > 0) {
        for (const file of files) {
          const fileType = file.mimetype.startsWith('video') ? 'video' : 'image';
          await db.execute(
            'INSERT INTO tbl_post_file (postId, filePath, fileType) VALUES (?, ?, ?)',
            [postId, `${process.env.SERVER_URL}/uploads/${file.filename}`, fileType]
          );
        }
      }

      // 3. 삭제할 파일 처리 (수정 시 사용하는 경우)
      if (deletedFiles) {
        const deleteList = JSON.parse(deletedFiles);
        for (const filePath of deleteList) {
          await db.execute(
            'DELETE FROM tbl_post_file WHERE filePath = ? AND postId = ?',
            [filePath, postId]
          );
          // 실제 파일도 삭제하고 싶다면 fs.unlink 사용 (파일시스템에서 삭제)
        }
      }

      const mentions = extractMentionedUserIds(content);

      // 4. 멘션 처리
      if (mentions) {

        for (const mentionedId of mentions) {
            
            await db.query(
              `INSERT INTO tbl_notifications (userId, type, message, relatedFeedId)
               VALUES (?, 'mention', ?, ?)`,
              [mentionedId, `${userName}님이 당신을 언급했습니다.`, postId]
            );
            
            await db.execute(
                'INSERT INTO tbl_mention (postId, mentionedUserId) VALUES (?, ?)',
                [postId, mentionedId]
              );

          }

      }
  
      // 5. 해시태그 처리
      if (hashtags) {
        const tags = JSON.parse(hashtags);
        for (const tag of tags) {
          const trimmed = tag.trim().toLowerCase();
          const [existing] = await db.execute(
            'SELECT hashtagId FROM tbl_hashtag WHERE tag = ?',
            [trimmed]
          );
          let hashtagId;
          if (existing.length > 0) {
            hashtagId = existing[0].hashtagId;
          } else {
            const [inserted] = await db.execute(
              'INSERT INTO tbl_hashtag (tag) VALUES (?)',
              [trimmed]
            );
            hashtagId = inserted.insertId;
          }
          await db.execute(
            'INSERT INTO tbl_post_hashtag (postId, hashtagId) VALUES (?, ?)',
            [postId, hashtagId]
          );
        }
      }
  
      res.json({ message: '피드 등록 완료', postId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '서버 에러' });
    }
  };

exports.getAllPosts = async (req, res) => {
    const userId = req.user.id;
    const { filter } = req.query;
  
    let query = `
      SELECT p.*, u.username, u.profileImage,
        (SELECT COUNT(*) FROM tbl_post_like WHERE postId = p.postId) AS likeCount,
        (SELECT COUNT(*) FROM tbl_comment WHERE postId = p.postId) AS commentCount,
        EXISTS(SELECT 1 FROM tbl_post_like WHERE postId = p.postId AND userId = ?) AS liked
      FROM tbl_post p
      JOIN tbl_users u ON p.userId = u.id
    `;
    let where = '';
    const params = [userId];
  
    if (filter === 'my') {
      where = 'WHERE p.userId = ?';
      params.push(userId);
    } else if (filter === 'mention') {
      query += ' JOIN tbl_mention m ON p.postId = m.postId';
      where = 'WHERE m.mentionedUserId = ?';
      params.push(userId);
    }
  
    query += ` ${where} ORDER BY p.createdAt DESC`;
  
    try {
      // 1. 피드 목록 가져오기
      const [posts] = await db.execute(query, params);
  
      // 2. 피드 ID 목록 추출
      const postIds = posts.map(p => p.postId);
      let files = [];
  
      if (postIds.length > 0) {
        // 3. 피드 ID 목록에 해당하는 모든 파일 조회
        const [fileRows] = await db.execute(`
          SELECT * FROM tbl_post_file
          WHERE postId IN (${postIds.map(() => '?').join(',')})
        `, postIds);
        files = fileRows;
      }
  
      // 4. 각 post 객체에 files 배열 추가
      const postMap = posts.map(post => ({
        ...post,
        files: files.filter(file => file.postId === post.postId)
      }));
  
      res.json(postMap);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '피드 조회 실패' });
    }
  };
  

// 📌 3. 댓글 작성 (대댓글 포함)
exports.addComment = async (req, res) => {
  const { postId, content, parentId } = req.body;
  const userId = req.user.id; // JWT에서 사용자 ID를 가져옵니다.

  try {
    await db.execute(
      'INSERT INTO tbl_comment (postId, userId, parentId, content) VALUES (?, ?, ?, ?)',
      [postId, userId, parentId || null, content]
    );
    res.json({ message: '댓글 등록 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '댓글 등록 실패' });
  }
};

// 📌 4. 좋아요 토글
exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // JWT에서 사용자 ID를 가져옵니다.

  try {
    const [rows] = await db.execute(
      'SELECT * FROM tbl_post_like WHERE postId = ? AND userId = ?',
      [postId, userId]
    );

    if (rows.length > 0) {
      await db.execute(
        'DELETE FROM tbl_post_like WHERE postId = ? AND userId = ?',
        [postId, userId]
      );
      res.json({ message: '좋아요 취소' });
    } else {
      await db.execute(
        'INSERT INTO tbl_post_like (postId, userId) VALUES (?, ?)',
        [postId, userId]
      );
      res.json({ message: '좋아요 완료' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '좋아요 처리 실패' });
  }
};
