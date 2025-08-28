
import express from 'express';
import DayTask from '../model/DayTask.js';
import verifyToken from '../src/middleware/verifyToken.js';
const router = express.Router();

// Get tasks for a specific date
router.get('/:date', verifyToken, async (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD
    const user = req.user.id;
    const dayTask = await DayTask.findOne({ user, date });
    res.json(dayTask || { date, pending: [], completed: [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create/update tasks for a specific date
router.post('/:date', verifyToken, async (req, res) => {
  try {
    const { date } = req.params;
    const user = req.user.id;
    const { pending = [], completed = [] } = req.body;
    const dayTask = await DayTask.findOneAndUpdate(
      { user, date },
      { $set: { pending, completed } },
      { upsert: true, new: true }
    );
    res.json(dayTask);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete tasks for a specific date
router.delete('/:date', verifyToken, async (req, res) => {
  try {
    const { date } = req.params;
    const user = req.user.id;
    await DayTask.findOneAndDelete({ user, date });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
