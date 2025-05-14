const db = require('../models/db');

// 채팅방 생성
exports.createRoom = async (req, res) => {
  const { roomName, userIds } = req.body;
  try {
    const [result] = await db.execute('INSERT INTO tbl_chat_rooms (roomName) VALUES (?)', [roomName]);
    const roomId = result.insertId;

    const values = userIds.map((userId) => [roomId, userId]);
    await db.query('INSERT INTO tbl_chat_room_users (roomId, userId) VALUES ?', [values]);

    res.status(201).json({ roomId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 채팅방 목록 (참여 중인 채팅방 + 다른 유저 정보 포함)
exports.getRooms = async (req, res) => {
  const userId = req.user.id;

  try {
    // 채팅방 목록 + 다른 유저들 정보 가져오기
    const [rows] = await db.query(
      `
      SELECT 
        r.id AS roomId, 
        r.roomName,
        u.id AS participantId,
        u.username AS participantName,
        u.profileImage
      FROM tbl_chat_rooms r
      JOIN tbl_chat_room_users ru1 ON r.id = ru1.roomId
      JOIN tbl_chat_room_users ru2 ON r.id = ru2.roomId
      JOIN tbl_users u ON ru2.userId = u.id
      WHERE ru1.userId = ? AND ru2.userId != ?
      ORDER BY r.id
      `,
      [userId, userId]
    );

    // 결과를 채팅방 단위로 그룹화
    const roomMap = new Map();

    for (const row of rows) {
      if (!roomMap.has(row.roomId)) {
        roomMap.set(row.roomId, {
          roomId: row.roomId,
          roomName: row.roomName,
          participants: [],
        });
      }
      roomMap.get(row.roomId).participants.push({
        id: row.participantId,
        username: row.participantName,
        profileImage: row.profileImage,
      });
    }

    res.json([...roomMap.values()]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 메시지 목록 페이징
exports.getMessages = async (req, res) => {
  const roomId = req.params.roomId;
  const limit = parseInt(req.query.limit) || 20;
  const beforeMessageId = req.query.beforeMessageId;

  console.log(limit,beforeMessageId);
  try {
    let query = `
      SELECT m.id, m.content, m.createdAt, m.senderId, m.fileUrl, m.fileType, m.isDeleted,
             u.username, u.profileImage
      FROM tbl_messages m
      JOIN tbl_users u ON m.senderId = u.id
      WHERE m.roomId = ? AND m.isDeleted = 0
    `;
    const params = [roomId];

    // 특정 메시지 ID 이전 메시지만 불러오기
    if (beforeMessageId) {
      query += ' AND m.id < ?';
      params.push(beforeMessageId);
    }

    query += ' ORDER BY m.id DESC LIMIT ?'; // DESC로 불러온 후 프론트에서 시간순 정렬
    params.push(limit);

    const [messages] = await db.query(query, params);

    // 시간순 정렬 ASC (프론트에서 보기 좋게)
    messages.reverse();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 1:1 채팅방 생성 또는 조회
exports.openDirectChat = async (req, res) => {
  const userId = req.user.id;
  const targetUserId = req.body.targetUserId;
  const providedRoomName = req.body.roomName; // 사용자가 roomName을 보냈을 수도 있음

  if (!targetUserId || userId === targetUserId) {
    return res.status(400).json({ error: '잘못된 요청입니다.' });
  }

  try {
    // 기존 동일한 1:1 채팅방이 있는지 확인
    const [existing] = await db.query(
      `SELECT r.id
       FROM tbl_chat_rooms r
       JOIN tbl_chat_room_users ru1 ON r.id = ru1.roomId
       JOIN tbl_chat_room_users ru2 ON r.id = ru2.roomId
       WHERE ru1.userId IN (?, ?) AND ru2.userId IN (?, ?)
       GROUP BY r.id
       HAVING COUNT(DISTINCT ru1.userId) = 2`,
      [userId, targetUserId, userId, targetUserId]
    );

    if (existing.length > 0) {
      const roomId = existing[0].id;
    
      // 채팅방 이름 및 유저 목록 같이 가져오기
      const [[room]] = await db.query(
        'SELECT id, roomName FROM tbl_chat_rooms WHERE id = ?',
        [roomId]
      );
    
      const [participants] = await db.query(
        `SELECT u.id, u.username, u.profileImage
         FROM tbl_chat_room_users cru
         JOIN tbl_users u ON cru.userId = u.id
         WHERE cru.roomId = ?`,
        [roomId]
      );
    
      return res.status(200).json({
        ...room,
        participants,
      });
    }

    // 상대방 유저 정보 조회
    const [targetUser] = await db.query(
      'SELECT username FROM tbl_users WHERE id = ?',
      [targetUserId]
    );

    if (targetUser.length === 0) {
      return res.status(404).json({ error: '상대방 유저를 찾을 수 없습니다.' });
    }

    const targetUsername = targetUser[0].username;
    const roomName = providedRoomName || `${targetUsername}님과의 1:1 채팅`;

    // 채팅방 생성
    const [roomResult] = await db.execute(
      'INSERT INTO tbl_chat_rooms (roomName) VALUES (?)',
      [roomName]
    );
    const roomId = roomResult.insertId;

    const values = [
      [roomId, userId],
      [roomId, targetUserId],
    ];

    await db.query(
      'INSERT INTO tbl_chat_room_users (roomId, userId) VALUES ?',
      [values]
    );

    res.status(201).json({ roomId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrGetGroupChatRoom = async (req, res) => {
  let userIds = req.body.userIds || [];
  const requesterId = req.user.id;

  // 요청자 본인을 포함
  if (!userIds.includes(requesterId)) {
    userIds.push(requesterId);
  }

  // 유저 수가 2명 이상이어야 그룹채팅 가능
  if (userIds.length < 2) {
    return res.status(400).json({ error: '2명 이상의 사용자로 방을 만들어야 합니다.' });
  }

  // userIds 정렬 (순서를 통일하기 위해)
  userIds.sort((a, b) => a - b);

  try {
    // 같은 멤버들로만 구성된 방이 있는지 확인
    const placeholders = userIds.map(() => '?').join(',');
    const [candidates] = await db.query(
      `SELECT ru.roomId
       FROM tbl_chat_room_users ru
       WHERE ru.userId IN (${placeholders})
       GROUP BY ru.roomId
       HAVING COUNT(*) = ? AND COUNT(DISTINCT ru.userId) = ?`,
      [...userIds, userIds.length, userIds.length]
    );

    if (candidates.length > 0) {
      return res.status(200).json({ roomId: candidates[0].roomId });
    }

    // 방 이름 (자동 생성 또는 클라이언트에서 전달받아도 가능)
    const roomName = req.body.roomName || '그룹 채팅';

    // 새 방 생성
    const [roomResult] = await db.execute(
      'INSERT INTO tbl_chat_rooms (roomName) VALUES (?)',
      [roomName]
    );
    const roomId = roomResult.insertId;

    // 방 참여자 등록
    const values = userIds.map(userId => [roomId, userId]);
    await db.query(
      'INSERT INTO tbl_chat_room_users (roomId, userId) VALUES ?',
      [values]
    );

    res.status(201).json({ roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


exports.readMessage = async (req, res) => {
  const userId = req.user.id;
  const { messageId } = req.body;

  try {
    await db.execute(
      'INSERT IGNORE INTO tbl_message_reads (messageId, userId) VALUES (?, ?)',
      [messageId, userId]
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  const userId = req.user.id;
  const { messageId } = req.params;

  try {
    // 보낸 사람만 삭제 가능
    const [[msg]] = await db.query(
      'SELECT senderId FROM tbl_messages WHERE id = ?',
      [messageId]
    );

    if (!msg || msg.senderId !== userId) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    await db.execute(
      'UPDATE tbl_messages SET isDeleted = TRUE WHERE id = ?',
      [messageId]
    );

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.fileUpload = (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
  }

  // 클라이언트가 접근할 수 있는 URL 경로
  const fileUrl = `${process.env.SERVER_URL}/uploads/${file.filename}`;

  res.json({
    fileUrl,
    fileName: file.originalname,
    fileType: file.mimetype
  });
};