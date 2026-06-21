const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, requireRole } = require('../middleware/auth');

// GET /api/orders — list orders by role
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') query.customer = req.user._id;
    else if (req.user.role === 'artist') {
      query = { $or: [{ artist: req.user._id }, { status: 'pending', artist: null }] };
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email avatar')
      .populate('artist', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders — customer creates order
router.post('/', protect, requireRole('customer'), async (req, res) => {
  try {
    const { title, description, budget, deadline, category, requirements } = req.body;
    const order = await Order.create({
      title, description, budget, deadline, category,
      requirements: requirements || {},
      customer: req.user._id
    });

    const populated = await order.populate('customer', 'name email avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email avatar')
      .populate('artist', 'name email avatar');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner =
      order.customer._id.toString() === req.user._id.toString() ||
      (order.artist && order.artist._id.toString() === req.user._id.toString());

    if (!isOwner && req.user.role !== 'artist')
      return res.status(403).json({ message: 'Access denied' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status — artist updates status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const validTransitions = {
      artist: ['accepted', 'in_progress', 'review', 'completed', 'cancelled'],
      customer: ['revision_requested', 'approved', 'cancelled']
    };

    if (!validTransitions[req.user.role]?.includes(status))
      return res.status(400).json({ message: 'Invalid status transition for your role' });

    // Artist accepts open order
    if (status === 'accepted' && req.user.role === 'artist') {
      order.artist = req.user._id;
    }

    order.status = status;
    await order.save();

    const populated = await order.populate([
      { path: 'customer', select: 'name email avatar' },
      { path: 'artist', select: 'name email avatar' }
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
