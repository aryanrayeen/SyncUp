import Goal from "../model/Goal.js";

export const logGoal = async (req, res) => {
  try {
    const { title, description, targetDate, completed, completionDate } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const goal = new Goal({
      userId,
      title,
      description,
      targetDate,
      completed: completed || false,
      completionDate,
    });
    await goal.save();
    res.status(201).json({ message: "Goal saved!", goal });
  } catch (err) {
    console.error("logGoal error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getWeeklyGoalSummary = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const goals = await Goal.find({
      userId,
      targetDate: { $gte: weekAgo }
    });
    res.json({ goals });
  } catch (err) {
    console.error("getWeeklyGoalSummary error:", err);
    res.status(500).json({ error: err.message });
  }
};
