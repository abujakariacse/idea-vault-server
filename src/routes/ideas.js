const express = require('express');
const Idea = require('../models/Idea');
const User = require('../models/User');
const Report = require('../models/Report');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, category, sort, minLikes, startDate, endDate, page = 1, limit = 9 } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'most_liked') sortOption = { likeCount: -1, createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const ideas = await Idea.find(query)
      .populate('author', 'name photo')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Idea.countDocuments(query);

    res.json({ ideas, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const ideas = await Idea.find().populate('author', 'name photo').sort({ likeCount: -1, createdAt: -1 }).limit(6);
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).populate('author', 'name photo photo');
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.isBanned) {
      return res.status(403).json({ message: 'You are banned from creating ideas.' });
    }
    if (user.warnedUntil && new Date(user.warnedUntil) > new Date()) {
      return res.status(403).json({ message: 'You are currently warned and cannot post ideas until ' + new Date(user.warnedUntil).toLocaleDateString() });
    }

    const { title, shortDescription, detailedDescription, category, tags, image, estimatedBudget, targetAudience, problemStatement, proposedSolution } = req.body;
    const idea = new Idea({ title, shortDescription, detailedDescription, category, tags, image, estimatedBudget, targetAudience, problemStatement, proposedSolution, author: req.user.id });
    await idea.save();
    res.status(201).json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const idea = await Idea.findOneAndUpdate({ _id: req.params.id, author: req.user.id }, req.body, { new: true });
    if (!idea) return res.status(404).json({ message: 'Idea not found or unauthorized' });
    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const idea = await Idea.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!idea) return res.status(404).json({ message: 'Idea not found or unauthorized' });
    res.json({ message: 'Idea deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    const likeIndex = idea.likes.findIndex(id => id.toString() === req.user.id);
    const dislikeIndex = idea.dislikes.findIndex(id => id.toString() === req.user.id);

    if (dislikeIndex > -1) {
      idea.dislikes.splice(dislikeIndex, 1);
      idea.dislikeCount = idea.dislikes.length;
    }

    if (likeIndex > -1) {
      idea.likes.splice(likeIndex, 1);
      idea.likeCount = idea.likes.length;
    } else {
      idea.likes.push(req.user.id);
      idea.likeCount = idea.likes.length;
    }
    await idea.save();
    res.json({ 
      likeCount: idea.likeCount, 
      dislikeCount: idea.dislikeCount,
      liked: likeIndex === -1,
      disliked: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/dislike', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    const likeIndex = idea.likes.findIndex(id => id.toString() === req.user.id);
    const dislikeIndex = idea.dislikes.findIndex(id => id.toString() === req.user.id);

    if (likeIndex > -1) {
      idea.likes.splice(likeIndex, 1);
      idea.likeCount = idea.likes.length;
    }

    if (dislikeIndex > -1) {
      idea.dislikes.splice(dislikeIndex, 1);
      idea.dislikeCount = idea.dislikes.length;
    } else {
      idea.dislikes.push(req.user.id);
      idea.dislikeCount = idea.dislikes.length;
    }
    await idea.save();
    res.json({ 
      likeCount: idea.likeCount, 
      dislikeCount: idea.dislikeCount,
      liked: false,
      disliked: dislikeIndex === -1
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/report', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    const { reason, additionalInfo, photoUrl } = req.body;
    
    const report = new Report({
      idea: idea._id,
      reporter: req.user.id,
      reason,
      additionalInfo,
      photoUrl
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;