const express = require('express');
const Comment = require('../models/Comment');
const Idea = require('../models/Idea');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/idea/:ideaId', async (req, res) => {
  try {
    const comments = await Comment.find({ idea: req.params.ideaId }).populate('user', 'name photo').sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { ideaId, text } = req.body;
    const idea = await Idea.findById(ideaId);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    const comment = new Comment({ user: req.user.id, idea: ideaId, text });
    await comment.save();
    const populatedComment = await Comment.findById(comment._id).populate('user', 'name photo');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { text }, { new: true }).populate('user', 'name photo');
    if (!comment) return res.status(404).json({ message: 'Comment not found or unauthorized' });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!comment) return res.status(404).json({ message: 'Comment not found or unauthorized' });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;