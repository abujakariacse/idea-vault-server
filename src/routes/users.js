const express = require('express');
const User = require('../models/User');
const Idea = require('../models/Idea');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/my-ideas', auth, async (req, res) => {
  try {
    const ideas = await Idea.find({ author: req.user.id }).populate('author', 'name photo').sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-interactions', auth, async (req, res) => {
  try {
    const likedIdeas = await Idea.find({ likes: req.user.id }).populate({ path: 'author', select: 'name photo' }).sort({ createdAt: -1 });
    const comments = await Comment.find({ user: req.user.id }).populate({ path: 'idea', populate: { path: 'author', select: 'name photo' } }).sort({ createdAt: -1 });
    res.json({ likedIdeas, comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, photo } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, photo }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bookmark/:ideaId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const bookmarkIndex = user.bookmarks.indexOf(req.params.ideaId);
    if (bookmarkIndex > -1) {
      user.bookmarks.splice(bookmarkIndex, 1);
    } else {
      user.bookmarks.push(req.params.ideaId);
    }
    await user.save();
    res.json({ bookmarked: bookmarkIndex === -1, bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;