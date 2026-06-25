const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  detailedDescription: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  image: { type: String },
  estimatedBudget: { type: String },
  targetAudience: { type: String },
  problemStatement: { type: String },
  proposedSolution: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Idea', ideaSchema);