const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

// POST /api/upload - Protected single file upload
router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file was uploaded.' });
  }

  // Determine relative url
  let subfolder = 'general';
  if (req.file.destination.includes('gallery')) subfolder = 'gallery';
  else if (req.file.destination.includes('covers')) subfolder = 'covers';
  else if (req.file.destination.includes('documents')) subfolder = 'documents';

  const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;

  return res.json({
    success: true,
    message: 'File uploaded successfully.',
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

module.exports = router;
