const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config();

// Configure AWS S3 Client for Supabase
const s3Config = new S3Client({
  forcePathStyle: true,
  region: process.env.SUPABASE_S3_REGION || 'ap-southeast-1',
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY,
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: process.env.SUPABASE_S3_BUCKET || 'Images',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      // Save inside a folder named 'products' in the bucket
      cb(null, `products/${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: { files: 10, fileSize: 5 * 1024 * 1024 }
});

module.exports = { upload, s3Config };
