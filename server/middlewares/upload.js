const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getDatePath = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
};

const storage = multer.memoryStorage(); // multer에선 메모리 저장

const uploadMiddleware = multer({ storage });

// S3 업로드 미들웨어 확장 함수
const uploadToS3 = (folder = 'default') => async (req, res, next) => {
  if (!req.files && !req.file) return next();

  const files = req.files || [req.file];

  try {
    const uploadedFiles = [];

    for (const file of files) {
      const ext = path.extname(file.originalname);
      const key = `uploads/${folder}/${getDatePath()}/${uuidv4()}${ext}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3.send(command);
      const location = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      uploadedFiles.push({
        originalName: file.originalname,
        key,
        location,
        mimetype: file.mimetype,
      });
    }

    req.s3Files = uploadedFiles;
    next();
  } catch (err) {
    console.error('S3 upload error:', err);
    res.status(500).json({ error: 'Failed to upload file(s) to S3' });
  }
};

// 미들웨어 조합
const upload = {
  single: (fieldName, folder = 'default') => [
    uploadMiddleware.single(fieldName),
    uploadToS3(folder),
  ],
  array: (fieldName, maxCount = 5, folder = 'default') => [
    uploadMiddleware.array(fieldName, maxCount),
    uploadToS3(folder),
  ],
};

module.exports = upload;
