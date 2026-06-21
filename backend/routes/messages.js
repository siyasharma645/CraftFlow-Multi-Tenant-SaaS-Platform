const express = require('express');
const router = express.Router({ mergeParams: true });
const Message = require('../models/Message');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// GET /api/orders/:orderId/messages
router.get('/', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isParticipant =
      order.customer.toString() === req.user._id.toString() ||
      (order.artist && order.artist.toString() === req.user._id.toString());

    if (!isParticipant)
      return res.status(403).json({ message: 'Access denied' });

    const messages = await Message.find({ order: req.params.orderId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders/:orderId/messages
router.post('/', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message content required' });

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isParticipant =
      order.customer.toString() === req.user._id.toString() ||
      (order.artist && order.artist.toString() === req.user._id.toString());

    if (!isParticipant)
      return res.status(403).json({ message: 'Only order participants can message' });

    const message = await Message.create({
      order: req.params.orderId,
      sender: req.user._id,
      content: content.trim()
    });

    const populated = await message.populate('sender', 'name avatar role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
