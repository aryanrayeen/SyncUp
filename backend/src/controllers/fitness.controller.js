import FitnessLog from "../model/FitnessLog.js";

export const logFitness = async (req, res) => {
  try {
    const { date, duration, calories, exercises } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const log = new FitnessLog({
      userId,
      date,
      duration,
      calories,
      exercises,
    });

    await log.save();
    res.status(201).json({ message: "Fitness log saved!", log });
  } catch (err) {
    console.error("logFitness error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getWeeklyFitnessSummary = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);

    const logs = await FitnessLog.find({
      userId,
      date: { $gte: weekAgo }
    });

    res.json({ logs });
  } catch (err) {
    console.error("getWeeklyFitnessSummary error:", err);
    res.status(500).json({ error: err.message });
  }
};
