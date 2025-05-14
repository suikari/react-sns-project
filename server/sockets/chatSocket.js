module.exports = (io) => {
  const db = require('../models/db');

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on('sendMessage', async ({ roomId, senderId, content, fileUrl, fileType }) => {
      try {
        // 1. 메시지 저장
        await db.execute(
          `INSERT INTO tbl_messages (roomId, senderId, content, fileUrl, fileType)
          VALUES (?, ?, ?, ?, ?)`,
          [roomId, senderId, content, fileUrl || null, fileType || null]
        );

        const createdAt = new Date();

        // 2. 메시지 실시간 전송
        io.to(roomId).emit('receiveMessage', {
          roomId,
          senderId,
          content,
          createdAt,
          fileUrl,
          fileType,
        });

        // 3. 채팅방 참여자 중 나를 제외한 유저들에게 알림 저장
        const [userRows] = await db.query(
          'SELECT userId FROM tbl_chat_room_users WHERE roomId = ? AND userId != ?',
          [roomId, senderId]
        );

        // 4. 보낸 사람 이름 조회
        const [senderRow] = await db.execute(
          'SELECT username FROM tbl_users WHERE id = ?',
          [senderId]
        );
        const senderName = senderRow[0]?.username || '알 수 없음';

        // 5. 알림 메시지 텍스트
        const message = `${senderName}님이 채팅을 보냈습니다.`;

        for (const row of userRows) {
          const receiverId = row.userId;

          // 6. 최근 3분 이내 동일한 알림이 있는지 확인
          const [latest] = await db.execute(
            `SELECT message FROM tbl_notifications 
            WHERE userId = ? AND type = 'dm' AND relatedFeedId = ?
              AND message = ? AND createdAt >= NOW() - INTERVAL 3 MINUTE
            ORDER BY createdAt DESC LIMIT 1`,
            [receiverId, roomId, message]
          );

          const isDuplicate = latest.length > 0;

          if (!isDuplicate) {
            // 7. 알림 저장
            await db.execute(
              `INSERT INTO tbl_notifications (userId, type, message, relatedFeedId)
              VALUES (?, 'dm', ?, ?)`,
              [receiverId, message, roomId]
            );

            // 8. 실시간 알림 전송
            io.to(roomId).emit('chatNotification', {
              to: receiverId,
              message,
              roomId,
            });
          }
        }
      } catch (err) {
        console.error('메시지 전송 에러:', err.message);
      }
    });
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
