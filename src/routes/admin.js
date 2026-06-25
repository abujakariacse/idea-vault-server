const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Idea = require('../models/Idea');
const Comment = require('../models/Comment');
const Report = require('../models/Report');

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

router.put('/users/:id/role', async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    
    if (req.user.id === targetUser._id.toString()) {
      return res.status(403).json({ message: 'You cannot change your own role' });
    }

    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'super-admin' && targetUser.role === 'super-admin') {
      return res.status(403).json({ message: 'You cannot change a super-admin\'s role' });
    }

    const { role } = req.body;
    if (!['user', 'admin', 'super-admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (role === 'super-admin' && currentUser.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only a super-admin can assign the super-admin role' });
    }

    targetUser.role = role;
    await targetUser.save();
    res.json(targetUser);
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

// Admin Report Routes
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate({ path: 'idea', populate: { path: 'author', select: 'name email' } })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/reports/:id/dismiss', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: 'dismissed' }, { new: true });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/reports/:id/warn', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('idea');
    if (!report || !report.idea) return res.status(404).json({ message: 'Report or Idea not found' });
    
    // Warn user for 3 days
    const warnDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(report.idea.author, { warnedUntil: warnDate });
    
    report.status = 'resolved';
    await report.save();
    res.json({ message: 'User warned for 3 days', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/reports/:id/ban', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('idea');
    if (!report || !report.idea) return res.status(404).json({ message: 'Report or Idea not found' });
    
    await User.findByIdAndUpdate(report.idea.author, { isBanned: true });
    
    report.status = 'resolved';
    await report.save();
    res.json({ message: 'User permanently banned', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/reports/:id/idea', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    
    await Idea.findByIdAndDelete(report.idea);
    await Comment.deleteMany({ idea: report.idea });
    
    // update report status
    report.status = 'resolved';
    await report.save();

    res.json({ message: 'Idea deleted and report resolved', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
