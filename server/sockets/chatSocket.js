module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
  
      socket.on('joinRoom', ({ roomId }) => {
        socket.join(roomId);
      });
  
      socket.on('sendMessage', async ({ roomId, senderId, content }) => {
        const db = require('../models/db');
        await db.execute(
          'INSERT INTO tbl_messages (roomId, senderId, content) VALUES (?, ?, ?)',
          [roomId, senderId, content]
        );
        io.to(roomId).emit('receiveMessage', { roomId, senderId, content, createdAt: new Date() });
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  };
  