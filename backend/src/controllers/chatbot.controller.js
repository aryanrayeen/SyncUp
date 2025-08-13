// Chatbot controller
export const chatBotReply = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  // Enhanced logic for demo
  const lowerMsg = message.toLowerCase();
  let reply = "I'm here to help! Ask me about fitness, finances, goals, or how to use the site.";

  if (lowerMsg.includes("weekly summary") || lowerMsg.includes("summary")) {
    reply = "You can find your weekly summary by clicking the profile button at the top right and selecting 'Weekly Summary.'";
  } else if (lowerMsg.includes("dashboard")) {
    reply = "The dashboard is your main page. You can access it from the sidebar or by clicking 'Dashboard.'";
  } else if (lowerMsg.includes("fitness")) {
    reply = "You can track your workouts, calories, and progress in the Fitness section or view trends in the 'Fitness & Progress' page.";
  } else if (lowerMsg.includes("finance") || lowerMsg.includes("expense") || lowerMsg.includes("budget")) {
    reply = "Manage your expenses and budget in the Finances section. Click 'Expenses' in the sidebar.";
  } else if (lowerMsg.includes("goal")) {
    reply = "Set and track your goals in the Goals section. Click 'Goals' in the sidebar.";
  } else if (lowerMsg.includes("profile")) {
    reply = "You can view and edit your profile by clicking 'Profile' in the sidebar or the profile button at the top right.";
  } else if (lowerMsg.includes("how") || lowerMsg.includes("help") || lowerMsg.includes("navigate") || lowerMsg.includes("use")) {
    reply = "Use the sidebar to navigate between Dashboard, Fitness, Goals, Expenses, and Profile. The profile button at the top right gives you more options.";
  }

  res.json({ reply });
};
