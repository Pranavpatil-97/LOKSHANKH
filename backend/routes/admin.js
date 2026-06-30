const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');
const Category = require('../models/Category');
const slugify = require('slugify');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const adminOnly = [protect, authorizeRoles('admin')];

// Get all users
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user role
router.patch('/users/:id/role', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all pending articles
router.get('/pending', ...adminOnly, async (req, res) => {
  try {
    const articles = await Article.find({ status: 'pending' })
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve article
router.patch('/articles/:id/approve', ...adminOnly, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status: 'published', publishedAt: new Date(), isFeatured: req.body.isFeatured || false },
      { new: true }
    );
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject article
router.patch('/articles/:id/reject', ...adminOnly, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: req.body.reason || '' },
      { new: true }
    );
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete article
router.delete('/articles/:id', ...adminOnly, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Get ALL articles (admin only)
router.get('/articles/all', ...adminOnly, async (req, res) => {
  try {
    const articles = await Article.find()
      .populate('author', 'name email')
      .populate('category', 'name nameMarathi')
      .sort({ createdAt: -1 })
    res.json({ success: true, articles })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
// Get analytics
router.get('/analytics', ...adminOnly, async (req, res) => {
  try {
    const totalUsers     = await User.countDocuments();
    const totalArticles  = await Article.countDocuments();
    const pendingCount   = await Article.countDocuments({ status: 'pending' });
    const publishedCount = await Article.countDocuments({ status: 'published' });
    const totalViews     = await Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalArticles,
        pendingCount,
        publishedCount,
        totalViews: totalViews[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create category
router.post('/categories', ...adminOnly, async (req, res) => {
  try {
    const { name, nameMarathi, color } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const category = await Category.create({ name, nameMarathi, slug, color });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all categories
router.get('/categories',  async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;