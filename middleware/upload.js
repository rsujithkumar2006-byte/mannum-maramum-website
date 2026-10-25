const multer = require('multer');
const path = require('path');
const fs = require('fs');

const baseUploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'general';
    if (file.fieldname === 'gallery' || req.baseUrl.includes('gallery')) {
      subfolder = 'gallery';
    } else if (file.fieldname === 'cover' || req.baseUrl.includes('projects') || req.baseUrl.includes('events')) {
      subfolder = 'covers';
    } else if (file.fieldname === 'document' || req.baseUrl.includes('partnerships')) {
      subfolder = 'documents';
    }

    const targetDir = path.join(baseUploadDir, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanExt = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, cleanExt).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    cb(null, `${safeBaseName}-${uniqueSuffix}${cleanExt}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
  const allowedDocTypes = ['application/pdf'];

  if (allowedImageTypes.includes(file.mimetype) || allowedDocTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, SVG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024 // 10MB
  },
  fileFilter
});

module.exports = upload;
