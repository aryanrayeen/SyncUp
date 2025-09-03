import ai from '../config/gemini.config.js';

export const chatBotReply = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    console.log('Gemini API Key:', process.env.GEMINI_API_KEY);
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    console.log('Gemini raw result:', result);
    let reply = result.response.text();
    console.log('Gemini reply text:', reply);
    if (!reply || reply.trim() === '') {
      reply = "I'm here to help! Ask me about fitness, finances, goals, or how to use the site.";
    }
    res.json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.json({ reply: "I'm here to help! Ask me about fitness, finances, goals, or how to use the site.", error: error?.message || error });
  }
};