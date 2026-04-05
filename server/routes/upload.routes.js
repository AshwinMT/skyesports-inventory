const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { makeAuth } = require('../middleware/auth.middleware');
const db = require('../db/database');

const router = express.Router();
const auth = makeAuth(db);

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Single or Multiple file upload
router.post('/', auth, upload.array('files', 10), (req, res) => {
  try {
    const files = req.files.map(f => ({
      name: f.originalname,
      url: `/uploads/${f.filename}`,
      type: f.mimetype.split('/')[0]
    }));
    res.json({ success: true, files });
  } catch (e) {
    res.status(500).json({ error: 'Upload failed: ' + e.message });
  }
});

module.exports = router;
