const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Idea = require('../models/Idea');
const Comment = require('../models/Comment');

const router = express.Router();

router.use(auth);
router.use(isAdmin);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Idea.deleteMany({ author: req.params.id });
    await Comment.deleteMany({ user: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/ideas', async (req, res) => {
  try {
    const ideas = await Idea.find().populate('author', 'name email');
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/ideas/:id', async (req, res) => {
  try {
    await Idea.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ idea: req.params.id });
    res.json({ message: 'Idea deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find().populate('user', 'name email').populate('idea', 'title');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/comments/:id', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
