import FitnessLog from "../model/FitnessLog.js";


export const logFitness = async (req, res) => {
  try {
    const { date, duration, calories, exercises } = req.body;
    const userId = req.user.id; 

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
    res.status(500).json({ error: err.message });
  }
};

export const getWeeklyFitnessSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);

    const logs = await FitnessLog.find({
      userId,
      date: { $gte: weekAgo }
    });

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};