const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const DesignVersion = require('../models/DesignVersion');
const Order = require('../models/Order');
const { protect, requireRole } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/designs/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only image and PDF files allowed'));
  }
});

// GET /api/orders/:orderId/designs
router.get('/', protect, async (req, res) => {
  try {
    const designs = await DesignVersion.find({ order: req.params.orderId })
      .populate('artist', 'name avatar')
      .populate('feedback.givenBy', 'name avatar')
      .sort({ versionNumber: -1 });

    res.json(designs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders/:orderId/designs — artist uploads design
router.post('/', protect, requireRole('artist'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.artist?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the assigned artist can upload designs' });

    // Count existing versions
    const count = await DesignVersion.countDocuments({ order: req.params.orderId });

    // Mark previous versions as superseded
    await DesignVersion.updateMany(
      { order: req.params.orderId, status: 'pending_review' },
      { status: 'superseded' }
    );

    const design = await DesignVersion.create({
      order: req.params.orderId,
      artist: req.user._id,
      versionNumber: count + 1,
      title: req.body.title || `Version ${count + 1}`,
      description: req.body.description || '',
      fileUrl: `/uploads/designs/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype
    });

    // Update order status to review
    order.status = 'review';
    await order.save();

    const populated = await design.populate('artist', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:orderId/designs/:id/feedback — customer gives feedback
router.patch('/:id/feedback', protect, requireRole('customer'), async (req, res) => {
  try {
    const { status, comment } = req.body;
    if (!['approved', 'revision_requested'].includes(status))
      return res.status(400).json({ message: 'Status must be approved or revision_requested' });

    const design = await DesignVersion.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });

    const order = await Order.findById(design.order);
    if (order.customer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the customer can give feedback' });

    design.status = status;
    design.feedback = { comment, givenBy: req.user._id, givenAt: new Date() };
    await design.save();

    // Update order status accordingly
    order.status = status === 'approved' ? 'approved' : 'revision_requested';
    await order.save();

    const populated = await design.populate([
      { path: 'artist', select: 'name avatar' },
      { path: 'feedback.givenBy', select: 'name avatar' }
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
