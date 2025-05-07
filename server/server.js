const express = require('express')
const cors = require('cors')
const app = express()
const authRoutes = require('./routes/authRoutes');
const feedRoutes = require('./routes/feedRoutes');
const userRoutes = require('./routes/usersRouter')
const path = require('path');



require('dotenv').config();


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

const session = require('express-session')


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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
