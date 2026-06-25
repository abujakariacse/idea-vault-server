require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const User = require('./src/models/User');
    const Idea = require('./src/models/Idea');
    const Comment = require('./src/models/Comment');

    await Comment.deleteMany({});
    await Idea.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    const password = await bcrypt.hash('Test123', 10);

    const user1 = await User.create({ name: 'Sarah Chen', email: 'sarah@example.com', password, photo: 'https://i.pravatar.cc/150?img=1' });
    const user2 = await User.create({ name: 'Alex Rivera', email: 'alex@example.com', password, photo: 'https://i.pravatar.cc/150?img=2' });
    const user3 = await User.create({ name: 'Jordan Kim', email: 'jordan@example.com', password, photo: 'https://i.pravatar.cc/150?img=3' });

    const idea1 = await Idea.create({
      title: 'AI-Powered Personal Finance Advisor',
      shortDescription: 'An intelligent app that learns your spending habits and provides personalized financial advice.',
      detailedDescription: 'This app uses machine learning algorithms to analyze your transactions, identify spending patterns, and offer actionable insights. It integrates with your bank accounts securely and provides real-time alerts for unusual spending. Features include budget tracking, investment recommendations, and debt payoff strategies.',
      category: 'AI',
      tags: ['fintech', 'ai', 'budgeting', 'personal-finance'],
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
      estimatedBudget: '$50,000',
      targetAudience: 'Young professionals aged 22-35',
      problemStatement: 'Many young adults struggle with managing their finances and lack access to affordable financial advisors.',
      proposedSolution: 'An AI-powered app that provides 24/7 personalized financial guidance at a fraction of the cost of traditional advisors.',
      author: user1._id,
      likeCount: 24,
      likes: [user2._id, user3._id]
    });

    const idea2 = await Idea.create({
      title: 'Virtual Reality Fitness Platform',
      shortDescription: 'Immersive VR workouts that make exercise fun and engaging for home users.',
      detailedDescription: 'Combine the motivation of group fitness classes with the convenience of home workouts. Our VR platform offers immersive environments, real-time form correction using AI, and social features to compete with friends. Includes yoga, HIIT, boxing, and meditation sessions.',
      category: 'Health',
      tags: ['vr', 'fitness', 'health', 'wellness'],
      image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800',
      estimatedBudget: '$100,000',
      targetAudience: 'Health-conscious individuals aged 25-45',
      problemStatement: 'Many people struggle to stay motivated with home workouts and lack the engagement of gym classes.',
      proposedSolution: 'A VR fitness platform that provides gym-quality workouts with immersive experiences and social features.',
      author: user2._id,
      likeCount: 18,
      likes: [user1._id]
    });

    const idea3 = await Idea.create({
      title: 'Smart Crop Monitoring System',
      shortDescription: 'IoT sensors and AI analytics to help small farmers optimize crop yields.',
      detailedDescription: 'Affordable soil sensors, weather integration, and mobile app for small-scale farmers. The system monitors soil moisture, nutrients, and pest threats. Provides actionable alerts and recommendations in local languages. Helps reduce water usage by 30% and increase yields by 20%.',
      category: 'Tech',
      tags: ['agriculture', 'iot', 'sustainability', 'farming'],
      image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
      estimatedBudget: '$75,000',
      targetAudience: 'Small-scale farmers globally',
      problemStatement: 'Small farmers lack access to expensive precision agriculture technology.',
      proposedSolution: 'An affordable, easy-to-use IoT system with AI-powered recommendations tailored for small farms.',
      author: user3._id,
      likeCount: 31,
      likes: [user1._id, user2._id]
    });

    const idea4 = await Idea.create({
      title: 'Mental Health Companion Chatbot',
      shortDescription: 'AI chatbot providing 24/7 emotional support and mental wellness tracking.',
      detailedDescription: 'A compassionate AI companion that provides immediate support during difficult moments. Features mood tracking, guided meditation, CBT exercises, and crisis intervention. Integrates with wearables for stress monitoring. Available in multiple languages.',
      category: 'AI',
      tags: ['mental-health', 'ai', 'wellness', 'chatbot'],
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800',
      estimatedBudget: '$60,000',
      targetAudience: 'Adults seeking mental wellness support',
      problemStatement: 'Access to mental health support is limited and expensive.',
      proposedSolution: 'An AI chatbot that provides accessible, affordable support while seamlessly connecting users to professionals when needed.',
      author: user1._id,
      likeCount: 42,
      likes: [user1._id, user2._id, user3._id]
    });

    const idea5 = await Idea.create({
      title: 'Blockchain Supply Chain Tracker',
      shortDescription: 'Transparent supply chain tracking from raw materials to consumer.',
      detailedDescription: 'End-to-end transparency using blockchain for luxury goods, organic products, and pharmaceuticals. Consumers scan QR codes to see the complete journey of products. Prevents counterfeiting and builds trust through verified data.',
      category: 'Tech',
      tags: ['blockchain', 'supply-chain', 'transparency', 'enterprise'],
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
      estimatedBudget: '$200,000',
      targetAudience: 'Luxury brands, organic food companies, pharma',
      problemStatement: 'Consumers cannot verify product authenticity or ethical sourcing.',
      proposedSolution: 'A blockchain-based verification system that tracks products from origin to purchase.',
      author: user2._id,
      likeCount: 15,
      likes: [user3._id]
    });

    const idea6 = await Idea.create({
      title: 'EdTech Language Immersion App',
      shortDescription: 'AR-powered language learning that puts you in real-world scenarios.',
      detailedDescription: 'Using augmented reality and AI, users practice conversations in simulated real-world scenarios like restaurants, airports, and business meetings. Speech recognition provides instant feedback on pronunciation and fluency.',
      category: 'Education',
      tags: ['edtech', 'ar', 'language', 'learning'],
      image: 'https://images.unsplash.com/photo-1544710165-01785f671c84?w=800',
      estimatedBudget: '$80,000',
      targetAudience: 'Language learners aged 18-45',
      problemStatement: 'Traditional language apps fail to prepare users for real conversations.',
      proposedSolution: 'AR-powered immersive practice sessions that simulate real-life situations.',
      author: user3._id,
      likeCount: 27,
      likes: [user1._id, user2._id]
    });

    await Comment.create([
      { user: user2._id, idea: idea1._id, text: 'This is exactly what I need! Would love to be a beta tester.' },
      { user: user3._id, idea: idea1._id, text: 'Great concept. Have you considered integrating with existing banking apps?' },
      { user: user1._id, idea: idea2._id, text: 'The VR fitness space is getting crowded, but your social features could set you apart.' },
      { user: user2._id, idea: idea3._id, text: 'Agriculture tech is underrated. This could help millions of small farmers.' },
      { user: user3._id, idea: idea4._id, text: 'Mental health apps need more visibility. Great initiative!' },
      { user: user1._id, idea: idea5._id, text: 'Supply chain transparency is becoming a legal requirement in some regions. Good timing.' },
    ]);

    console.log('Created 3 users, 6 ideas, 6 comments');
    console.log('\nSample Login Credentials:');
    console.log('Email: sarah@example.com');
    console.log('Password: Test123');
    console.log('\nEmail: alex@example.com');
    console.log('Password: Test123');

    await mongoose.disconnect();
  })
  .catch(e => {
    console.error('Error:', e.message);
    mongoose.disconnect();
  });
