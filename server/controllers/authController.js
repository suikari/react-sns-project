const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const { sendEmail } = require('../utils/mailer');
require('dotenv').config();


let codeStore = {};

// 이메일 인증 코드 전송
exports.sendVerification = async (req, res) => {
  

  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codeStore[email] = code;

  try {
    const [existing] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }

    await sendEmail(email, 'SNS 이메일 인증', `인증코드: ${code}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '이메일 전송 실패' });
  }
};

// 인증 코드 확인
exports.verifyCode = (req, res) => {
  const { email, code } = req.body;
  if (codeStore[email] === code) {
    delete codeStore[email];
    return res.json({ success: true });
  }
  res.json({ success: false });
};

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    const profileImage = req.file
    ? `${process.env.SERVER_URL}/uploads/${req.file.filename}`
    : null;  
    
    try {
      const [existing] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
      }
  
      const hashed = await bcrypt.hash(password, 10);
      await db.query(
        'INSERT INTO tbl_users (username, email, password, profileImage , emailVerified) VALUES (?, ?, ?, ?, 1)',
        [username, email, hashed, profileImage]
      );
      res.json({ success: true, message: '회원가입 완료' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '회원가입 실패' });
    }
  };

  exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const [rows] = await db.query(
        'SELECT * FROM tbl_users WHERE email = ?',
        [email]
      );
  
      if (rows.length === 0) {
        return res.status(400).json({ message: '존재하지 않는 이메일입니다.' });
      }
  
      const user = rows[0];
  
      if (!user.emailVerified) {
        return res.status(403).json({ message: '이메일 인증이 필요합니다.' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
      }
  
      // 로그인 시간 갱신
      await db.query(
        'UPDATE tbl_users SET lastLogin = NOW() WHERE id = ?',
        [user.id]
      );
  
      // JWT 발급
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '2h'
      });
  
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          profile_image: user.profileImage
        }
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '서버 오류' });
    }
  };

  exports.socialLogin = async (req, res) => {
    const { email, username, profileImage, provider } = req.body;
  
    try {
      const [rows] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
  
      let user;
  
      if (rows.length === 0) {
        // 신규 회원 등록
        const [result] = await db.query(`
          INSERT INTO tbl_users (email, username, profileImage, provider, emailVerified, lastLogin)
          VALUES (?, ?, ?, ?, true, NOW())
        `, [email, username, profileImage, provider]);
  
        const [newUserRows] = await db.query('SELECT * FROM tbl_users WHERE id = ?', [result.insertId]);
        user = newUserRows[0];
      } else {
        // 기존 회원: 로그인 시간만 갱신
        user = rows[0];
        await db.query('UPDATE tbl_users SET lastLogin = NOW() WHERE id = ?', [user.id]);
      }
  
      // JWT 발급
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '2h'
      });
  
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          profile_image: user.profileImage,
          provider: user.provider
        }
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '서버 오류' });
    }
  };