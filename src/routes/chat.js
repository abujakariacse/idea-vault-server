const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const systemInstruction = `
You are IdeaVault Support Bot, a helpful AI assistant for the IdeaVault website. 
IdeaVault is a platform where entrepreneurs and creators share their startup concepts, get feedback from the community, and track engagement. 
Users can register, login, add ideas, browse trending ideas, edit their ideas, and interact by liking and commenting.
The platform has a Dashboard with sections for "Add Idea", "My Ideas", "My Interactions", and a Profile settings page.
Please keep your answers concise, friendly, and helpful. Focus only on helping users navigate and use the IdeaVault platform. Do not hallucinate features that don't exist.
`;

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: 'Sorry, my AI features are currently offline because the GEMINI_API_KEY is not configured on the server.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction
    });

    // Map history to Google GenAI format if needed, though simple `{ role: 'user' | 'model', parts: [{ text }] }` is standard.
    const formattedHistory = (history || []).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ reply: 'Sorry, I encountered an error while connecting to my AI brain.' });
  }
});

module.exports = router;
