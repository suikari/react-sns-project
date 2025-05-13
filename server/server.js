const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');

const chatSocket = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });


app.use(session({
    secret: 'test1234',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly : true,
        secure: false,
        maxAge : 1000 * 60 * 30
    }
}));

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const feedRoutes = require('./routes/feedRoutes');
const userRoutes = require('./routes/usersRouter')
const chatRoutes = require('./routes/chatRoutes');
const notiRoutes = require('./routes/notifications')
const storyRoutes = require('./routes/storyRoutes')

app.use(express.json());
app.use(cors({
    origin : [ "http://localhost:3000" , "http://localhost:3001" ],
    credentials : true,
}));

// uploads 폴더를 정적(static)으로 서비스
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notiRoutes);
app.use('/api/story', storyRoutes);


chatSocket(io);



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
