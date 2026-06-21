const mongoose = require('mongoose');

const designVersionSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  versionNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending_review', 'approved', 'revision_requested', 'superseded'],
    default: 'pending_review'
  },
  feedback: {
    comment: { type: String, default: '' },
    givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    givenAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DesignVersion', designVersionSchema);
