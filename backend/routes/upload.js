const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

router.post('/', protect, authorizeRoles('employee', 'admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
  console.error("UPLOAD ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message,
    stack: err.stack
  });
}
});

module.exports = router;