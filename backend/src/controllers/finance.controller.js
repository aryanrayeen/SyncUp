import FinanceLog from "../model/FinanceLog.js";

export const logFinance = async (req, res) => {
  try {
    const { date, amount, category, description } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const log = new FinanceLog({
      userId,
      date,
      amount,
      category,
      description,
    });
    await log.save();
    res.status(201).json({ message: "Finance log saved!", log });
  } catch (err) {
    console.error("logFinance error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getWeeklyFinanceSummary = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const logs = await FinanceLog.find({
      userId,
      date: { $gte: weekAgo }
    });
    res.json({ logs });
  } catch (err) {
    console.error("getWeeklyFinanceSummary error:", err);
    res.status(500).json({ error: err.message });
  }
};
