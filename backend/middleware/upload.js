const path = require('path');
const multer = require('multer');

// Destination folder for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store in backend/uploads relative to project root
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    // Use timestamp + original name to avoid collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept image mime types only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 10, fileSize: 5 * 1024 * 1024 } // max 5 MB per file, max 10 files
});

module.exports = upload;
