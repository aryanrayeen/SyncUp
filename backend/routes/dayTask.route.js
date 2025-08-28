
import express from 'express';
import NewDayTask from '../model/DayTask.js';
import verifyToken from '../src/middleware/verifyToken.js';
const router = express.Router();

// Get tasks for a specific date
router.get('/:date', verifyToken, async (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD
    const user = req.userId;
  const dayTask = await NewDayTask.findOne({ user, date });
  res.json(dayTask || { date, pending: [], completed: [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create/update tasks for a specific date
router.post('/:date', verifyToken, async (req, res) => {
  try {
    const { date } = req.params;
    const user = req.userId;
    const { pending = [], completed = [] } = req.body;
    console.log('POST /day-tasks/:date debug:', { user, date, pending, completed });
    const dayTask = await NewDayTask.findOneAndUpdate(
      { user, date },
      { $set: { pending, completed } },
      { upsert: true, new: true }
    );
  res.json(dayTask);
  } catch (err) {
    console.error('Error in POST /day-tasks/:date:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete tasks for a specific date
router.delete('/:date', verifyToken, async (req, res) => {
  try {
    const { date } = req.params;
    const user = req.userId;
  await NewDayTask.findOneAndDelete({ user, date });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
