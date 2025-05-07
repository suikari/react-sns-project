const nodemailer = require('nodemailer');
require('dotenv').config(); // env 읽기

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"SNS 서비스" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  };
  console.log(process.env.EMAIL_USER);
  console.log(process.env.EMAIL_PASS);

  return transporter.sendMail(mailOptions);
};