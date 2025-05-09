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

// 채팅방 목록
exports.getRooms = async (req, res) => {
  const userId = req.userId;
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.roomName
       FROM tbl_chat_rooms r
       JOIN tbl_chat_room_users ru ON r.id = ru.roomId
       WHERE ru.userId = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 채팅방 메시지 목록
exports.getMessages = async (req, res) => {
  const roomId = req.params.roomId;
  try {
    const [messages] = await db.query(
      `SELECT m.id, m.content, m.createdAt, u.username, u.profileImage
       FROM tbl_messages m
       JOIN tbl_users u ON m.senderId = u.id
       WHERE m.roomId = ?
       ORDER BY m.createdAt ASC`,
      [roomId]
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
