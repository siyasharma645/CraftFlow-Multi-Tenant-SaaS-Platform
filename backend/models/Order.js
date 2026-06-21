const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'review', 'revision_requested', 'approved', 'completed', 'cancelled'],
    default: 'pending'
  },
  budget: { type: Number, required: true },
  deadline: { type: Date },
  category: { type: String, required: true },
  requirements: {
    dimensions: { type: String, default: '' },
    colorPreferences: { type: String, default: '' },
    style: { type: String, default: '' },
    additionalNotes: { type: String, default: '' }
  },
  referenceImages: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
