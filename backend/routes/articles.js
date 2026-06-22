const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Category = require('../models/Category');
const slugify = require('slugify');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public - get all published articles
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    const query = { status: 'published' };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const articles = await Article.find(query)
      .populate('author', 'name avatar')
      .populate('category', 'name nameMarathi color')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Article.countDocuments(query);

    res.json({ success: true, articles, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public - get trending articles
router.get('/trending', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .populate('author', 'name')
      .populate('category', 'name nameMarathi color')
      .sort({ views: -1 })
      .limit(5);
    res.json({ success: true, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public - get breaking news
router.get('/breaking', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published', isBreaking: true })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title slug publishedAt');
    res.json({ success: true, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public - get single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar')
      .populate('category', 'name nameMarathi color');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Employee - create article
router.post('/', protect, authorizeRoles('employee', 'admin'), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, thumbnail, isBreaking } = req.body;

    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();

    const article = await Article.create({
      title, content, excerpt, category, tags, thumbnail,
      isBreaking: isBreaking || false,
      slug,
      author: req.user._id,
      status: 'draft'
    });

    res.status(201).json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Employee - update own article
router.put('/:id', protect, authorizeRoles('employee', 'admin'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this article' });
    }

    const updated = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, article: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Employee - submit article for review
router.patch('/:id/submit', protect, authorizeRoles('employee', 'admin'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    article.status = 'pending';
    await article.save();

    res.json({ success: true, message: 'Article submitted for review', article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Employee - get own articles
router.get('/my/articles', protect, authorizeRoles('employee', 'admin'), async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user._id })
      .populate('category', 'name nameMarathi')
      .sort({ createdAt: -1 });
    res.json({ success: true, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;