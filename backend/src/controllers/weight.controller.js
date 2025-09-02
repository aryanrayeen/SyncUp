import WeightLog from '../../model/WeightLog.js';

// Get all weight logs for a user
export const getWeightHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const logs = await WeightLog.find({ user: userId }).sort({ date: 1 });
    res.json({ success: true, weights: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch weight history', error: err.message });
  }
};
