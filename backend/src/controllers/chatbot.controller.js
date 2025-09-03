import ai from '../config/gemini.config.js';

// System prompt to define the chatbot's role and knowledge
const SYSTEM_PROMPT = `You are SyncUp AI, a helpful assistant for the SyncUp wellness platform. You help users with:

PLATFORM FEATURES:
- Fitness tracking & workout plans
- Financial expense tracking & budgeting
- Goal setting & achievement tracking
- Meal planning & nutrition logging
- Weight tracking & progress monitoring
- Daily task management
- Achievement system with badges

FITNESS GUIDANCE:
- Creating workout routines
- Exercise recommendations
- Fitness goal setting
- Progress tracking tips
- Nutrition advice for fitness

FINANCE GUIDANCE:
- Expense tracking best practices
- Budgeting strategies
- Financial goal setting
- Saving tips
- Expense categorization

GOALS & PRODUCTIVITY:
- SMART goal setting
- Breaking down large goals
- Daily task management
- Progress tracking
- Motivation strategies

COMMON FAQS:
- How to set up your profile
- How to log workouts and meals
- How to track expenses
- How to set and achieve goals
- How to use the achievement system
- How to view progress and trends

Always be helpful, encouraging, and provide practical advice. Keep responses concise but informative. If users ask about specific features, guide them on how to use the platform effectively.`;

export const chatBotReply = async (req, res) => {
  const { message, sessionId, context } = req.body;
  
  if (!message) {
    return res.status(400).json({ 
      error: "No message provided",
      success: false 
    });
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Construct the conversation with system prompt
    let conversationContext = SYSTEM_PROMPT + "\n\nUser: " + message + "\n\nSyncUp AI:";
    
    // Add additional context if provided (user's current goals, recent activities, etc.)
    if (context) {
      conversationContext = SYSTEM_PROMPT + 
        "\n\nUser Context: " + JSON.stringify(context) +
        "\n\nUser: " + message + 
        "\n\nSyncUp AI:";
    }

    const result = await model.generateContent(conversationContext);
    let reply = result.response.text();
    
    // Fallback response if empty
    if (!reply || reply.trim() === '') {
      reply = "I'm here to help you with SyncUp! Ask me about fitness tracking, expense management, goal setting, meal planning, or any other features of the platform.";
    }

    // Clean up the response (remove any unwanted prefixes)
    reply = reply.replace(/^(SyncUp AI:|AI:|Assistant:)\s*/i, '').trim();

    res.json({ 
      reply,
      success: true,
      sessionId: sessionId || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Provide helpful fallback responses when API is unavailable
    let fallbackReply = "I'm experiencing some technical difficulties with my AI service right now, but I can still help you with SyncUp! ";
    
    // Provide relevant fallback based on keywords in the user's message
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      fallbackReply += "For fitness tracking, go to the Fitness page to log workouts, set goals, and view your progress. You can track exercises, sets, reps, and weights.";
    } else if (lowerMessage.includes('finance') || lowerMessage.includes('expense') || lowerMessage.includes('money') || lowerMessage.includes('budget')) {
      fallbackReply += "For expense tracking, visit the Expenses page to log your spending, categorize expenses, and monitor your budget goals.";
    } else if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      fallbackReply += "For goal setting, go to the Goals page where you can create SMART goals, track progress, and achieve milestones.";
    } else if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('nutrition')) {
      fallbackReply += "For meal planning, check the Meal Plan page to log your meals, track calories, and plan healthy eating.";
    } else {
      fallbackReply += "Navigate through the Dashboard to access Fitness tracking, Expense management, Goal setting, Meal planning, and more features to help with your wellness journey.";
    }

    res.status(200).json({ 
      reply: fallbackReply,
      success: true,
      fallback: true,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

// Get chatbot capabilities and help information
export const getChatbotInfo = async (req, res) => {
  try {
    const info = {
      name: "SyncUp AI",
      description: "Your personal wellness and productivity assistant powered by Gemini AI",
      capabilities: [
        "Fitness tracking guidance",
        "Financial management tips",
        "Goal setting strategies",
        "Meal planning advice",
        "Platform navigation help",
        "FAQ responses",
        "Motivation and encouragement"
      ],
      commonQuestions: [
        "How do I set up my fitness goals?",
        "How can I track my expenses effectively?",
        "What workout routines do you recommend?",
        "How do I log my meals?",
        "How does the achievement system work?",
        "Can you help me create a budget?",
        "How do I view my progress trends?"
      ],
      model: "Gemini 2.0 Flash",
      version: "1.0.0"
    };
    
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to retrieve chatbot information" 
    });
  }
};

// Health check endpoint for the chatbot service
export const chatbotHealthCheck = async (req, res) => {
  try {
    // Test Gemini API connectivity
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const testResult = await model.generateContent("Hello");
    
    res.json({
      success: true,
      status: "healthy",
      geminiApi: "connected",
      model: "gemini-2.0-flash",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "unhealthy",
      geminiApi: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};