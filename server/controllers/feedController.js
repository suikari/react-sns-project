const db = require('../models/db'); // DB 연결
require('dotenv').config();


// 멘션 파싱 함수: @username, @123, @한글멘션 => ['username', '123', '한글멘션']
function extractMentionedUserIds(content) {
  // @ 뒤에 숫자, 알파벳, 밑줄, 한글이 올 수 있도록 정규식 수정
  const matches = content.match(/@([a-zA-Z0-9_가-힣]+)/g);
  return matches ? matches.map(m => m.slice(1)) : [];  // @을 제거하고 멘션된 부분만 반환
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
      
      console.log("testmen",mentions);

      // 4. 멘션 처리
      if (mentions) {
        for (const mentionedName of mentions) {
            // 멘션된 사용자의 userId를 가져오기 위해 조회
            const [userResult] = await db.query(
                'SELECT id FROM tbl_users WHERE username = ?', [mentionedName]
            );
    
            // 만약 userId가 존재하지 않으면, 해당 사용자가 존재하지 않는 경우 처리
            if (userResult && userResult.length > 0) {
                const mentionedUserId = userResult[0].id;
    
                // 알림 테이블에 삽입
                await db.query(
                    `INSERT INTO tbl_notifications (userId, type, message, relatedFeedId)
                    VALUES (?, 'mention', ?, ?)`,
                    [mentionedUserId, `${mentionedName}님이 당신을 언급했습니다.`, postId]
                );
                
                // tbl_mention 테이블에 삽입
                await db.execute(
                    'INSERT INTO tbl_mention (postId, mentionedUserId) VALUES (?, ?)',
                    [postId, mentionedUserId]
                );
            } else {
                // 존재하지 않는 사용자에 대한 처리 (옵션)
                console.log(`User ${mentionedName} does not exist.`);
            }
        }
    }
    console.log("hashtags",hashtags);

      // 5. 해시태그 처리
      if (hashtags) {
          
        for (const tag of hashtags) {
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
    const userId = req.query.userId || req.user?.id; // 쿼리에서 userId를 가져오고, 없으면 req.user.id로 대체

    if (!userId) {
      return res.status(400).json({ message: 'userId가 필요하거나 로그인이 필요합니다.' });
    }

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
      let comments = [];
  
      if (postIds.length > 0) {
        // 3. 피드 ID 목록에 해당하는 모든 파일 조회
        const [fileRows] = await db.execute(
          `
          SELECT * FROM tbl_post_file
          WHERE postId IN (${postIds.map(() => '?').join(',')})`,
          postIds
        );
        files = fileRows;
  
        // 4. 각 피드에 대한 댓글 목록 조회
        const [commentRows] = await db.execute(
          `
          SELECT c.postId, c.commentId, c.content, c.createdAt, c.parentId, u.id , u.username, u.profileImage
          FROM tbl_comment c
          JOIN tbl_users u ON c.userId = u.id
          WHERE c.postId IN (${postIds.map(() => '?').join(',')})
          ORDER BY c.createdAt DESC`,
          postIds
        );
        comments = commentRows;
      }
  
      // 5. 각 post 객체에 files, comments 배열 추가
      const postMap = posts.map(post => ({
        ...post,
        files: files.filter(file => file.postId === post.postId),
        comments: comments.filter(comment => comment.postId === post.postId).map(comment => ({
          ...comment,
          isOwnComment: comment.userId === userId,  // 본인 댓글 여부 추가
        })),
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
    // 댓글 등록
    await db.execute(
      'INSERT INTO tbl_comment (postId, userId, parentId, content) VALUES (?, ?, ?, ?)',
      [postId, userId, parentId || null, content]
    );

    // 게시글 작성자 조회
    const [postRows] = await db.execute(
      'SELECT userId FROM tbl_post WHERE postId = ?',
      [postId]
    );

    if (postRows.length > 0) {
      const postOwnerId = postRows[0].userId;

      // 자기 자신에게는 알림 보내지 않음
      if (postOwnerId !== userId) {
        // 사용자 이름 조회
        const [senderRows] = await db.execute(
          'SELECT username FROM tbl_users WHERE id = ?',
          [userId]
        );
        const senderName = senderRows[0]?.username || '알 수 없음';

        // 알림 메시지 생성
        const message = `${senderName}님이 회원님의 게시글에 댓글을 남겼습니다.`;

        // 알림 저장
        await db.execute(
          `
          INSERT INTO tbl_notifications (userId, type, message, relatedFeedId)
          VALUES (?, 'comment', ?, ?)
          `,
          [postOwnerId, message, postId]
        );
      }
    }

    // 대댓글일 경우
    if (parentId) {
      // 부모 댓글 작성자 조회
      const [commentRows] = await db.execute(
        'SELECT userId FROM tbl_comment WHERE commentId = ?',
        [parentId]
      );

      if (commentRows.length > 0) {
        const commentOwnerId = commentRows[0].userId;

        // 자기 자신에게는 알림 보내지 않음
        if (commentOwnerId !== userId) {
          // 사용자 이름 조회
          const [senderRows] = await db.execute(
            'SELECT username FROM tbl_users WHERE id = ?',
            [userId]
          );
          const senderName = senderRows[0]?.username || '알 수 없음';

          // 알림 메시지 생성
          const message = `${senderName}님이 회원님의 댓글에 대댓글을 남겼습니다.`;

          // 알림 저장
          await db.execute(
            `
            INSERT INTO tbl_notifications (userId, type, message, relatedFeedId)
            VALUES (?, 'reply', ?, ?)
            `,
            [commentOwnerId, message, postId]
          );
        }
      }
    }

    res.json({ message: '댓글 등록 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '댓글 등록 실패' });
  }
};


// 📌 5. 댓글 수정
exports.updateComment = async (req, res) => {
  const { commentId, content } = req.body;
  const userId = req.user.id; // JWT에서 사용자 ID를 가져옵니다.

  try {
    // 1. 해당 댓글이 존재하는지 확인
    const [commentRows] = await db.execute(
      'SELECT * FROM tbl_comment WHERE commentId = ? AND userId = ?',
      [commentId, userId]
    );

    if (commentRows.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없거나 권한이 없습니다.' });
    }

    // 2. 댓글 수정
    await db.execute(
      'UPDATE tbl_comment SET content = ? WHERE commentId = ?',
      [content, commentId]
    );

    res.json({ message: '댓글 수정 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '댓글 수정 실패' });
  }
};

// 📌 6. 댓글 삭제
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id; // JWT에서 사용자 ID를 가져옵니다.

  try {
    // 1. 해당 댓글이 존재하는지 확인
    const [commentRows] = await db.execute(
      'SELECT * FROM tbl_comment WHERE commentId = ? AND userId = ?',
      [commentId, userId]
    );

    if (commentRows.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없거나 권한이 없습니다.' });
    }

    // 2. 해당 댓글에 대한 알림 삭제
    await db.execute(
      'DELETE FROM tbl_notifications WHERE relatedFeedId = ? AND userId = ? AND type = "comment"',
      [commentRows[0].postId, userId]
    );

    // 3. 댓글 삭제
    await db.execute(
      'DELETE FROM tbl_comment WHERE commentId = ?',
      [commentId]
    );

    res.json({ message: '댓글 삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '댓글 삭제 실패' });
  }
};

// 특정 사용자(userId)의 댓글 목록 가져오기
exports.getUserComments = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(`
      SELECT c.*, u.username, u.profileImage
      FROM tbl_comment c
      JOIN tbl_users u ON c.userId = u.id
      WHERE c.userId = ?
      ORDER BY c.createdAt DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('댓글 목록 조회 실패:', err);
    res.status(500).json({ error: '서버 오류' });
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

      // 2. 게시글 작성자 조회
      const [postRows] = await db.execute(
        'SELECT userId FROM tbl_post WHERE postId = ?',
        [postId]
      );

      if (postRows.length > 0) {
        const postOwnerId = postRows[0].userId;

        // 자기 자신에게는 알림 보내지 않음
        if (postOwnerId !== userId) {
          // 좋아요한 사용자 이름 가져오기 (필요 시)
          const [senderRows] = await db.execute(
            'SELECT username FROM tbl_users WHERE id = ?',
            [userId]
          );
          const senderName = senderRows[0]?.username || '알 수 없음';

          // 알림 메시지 생성
          const message = `${senderName}님이 회원님의 게시글을 좋아합니다.`;

          // 알림 삽입
          await db.execute(
            `
            INSERT INTO tbl_notifications (userId, type, message, relatedFeedId)
            VALUES (?, 'like', ?, ?)
            `,
            [postOwnerId, message, postId]
          );
        }
      }

      res.json({ message: '좋아요 완료' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '좋아요 처리 실패' });
  }
};

// 📌 단일 피드 조회
exports.getPostById = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;

  try {
    // 1. 피드 정보 조회
    const [postRows] = await db.execute(
      `
      SELECT p.*, u.username, u.profileImage,
        (SELECT COUNT(*) FROM tbl_post_like WHERE postId = p.postId) AS likeCount,
        (SELECT COUNT(*) FROM tbl_comment WHERE postId = p.postId) AS commentCount,
        EXISTS(SELECT 1 FROM tbl_post_like WHERE postId = p.postId AND userId = ?) AS liked
      FROM tbl_post p
      JOIN tbl_users u ON p.userId = u.id
      WHERE p.postId = ?`,
      [userId, postId]
    );

    if (postRows.length === 0) {
      return res.status(404).json({ message: '피드를 찾을 수 없습니다.' });
    }

    const post = postRows[0];

    // 2. 피드에 속한 파일 조회
    const [fileRows] = await db.execute(
      'SELECT * FROM tbl_post_file WHERE postId = ?',
      [postId]
    );
    post.files = fileRows;

    // 3. 댓글 목록 조회
    const [commentRows] = await db.execute(
      `
      SELECT c.commentId, c.content, c.createdAt, c.parentId, u.id , u.username, u.profileImage
      FROM tbl_comment c
      JOIN tbl_users u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt DESC`,
      [postId]
    );

    // 댓글 목록을 본인 댓글인지 여부 추가
    const comments = commentRows.map(comment => ({
      ...comment,
      isOwnComment: comment.userId === userId,
    }));

    post.comments = comments;

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '피드 상세 조회 실패' });
  }
};

exports.getUserLikedPosts = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(`
      SELECT 
        l.likeId, l.postId, l.userId, l.createdAt,
        u.username AS likedByUsername, u.profileImage AS likedByProfileImage,
        p.content, p.location, p.createdAt AS postCreatedAt,
        pu.id AS postUserId, pu.username AS postUsername, pu.profileImage AS postUserProfileImage,
        pf.filePath AS thumbnail
      FROM tbl_post_like l
      JOIN tbl_users u ON l.userId = u.id
      JOIN tbl_post p ON l.postId = p.postId
      JOIN tbl_users pu ON p.userId = pu.id
      LEFT JOIN (
        SELECT sub.postId, sub.filePath
        FROM (
          SELECT postId, filePath,
                 ROW_NUMBER() OVER (PARTITION BY postId ORDER BY createdAt ASC) AS rn
          FROM tbl_post_file
          WHERE fileType = 'image'
        ) sub
        WHERE sub.rn = 1
      ) pf ON l.postId = pf.postId
      WHERE l.userId = ?
      ORDER BY l.createdAt DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('좋아요 목록 조회 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
};
