const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  matchedCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  score: { type: Number, required: true },
  reason: { type: String }, // Explanation of why they match
  status: { type: String, enum: ['Suggested', 'Sent', 'Accepted', 'Rejected'], default: 'Suggested' }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
