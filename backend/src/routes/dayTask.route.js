import express from 'express';
import NewDayTask from '../model/DayTask.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

// Get all day tasks for a user
router.get('/all', verifyToken, async (req, res) => {
  try {
    const user = req.userId;
    const tasks = await NewDayTask.find({ user });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Save/update multiple day tasks for a user (bulk)
router.post('/bulk', verifyToken, async (req, res) => {
  try {
    const user = req.userId;
    const { tasks } = req.body; // [{ date, pending, completed }]
    if (!Array.isArray(tasks)) return res.status(400).json({ error: 'Tasks must be an array' });
    const results = [];
    for (const t of tasks) {
      const updated = await NewDayTask.findOneAndUpdate(
        { user, date: t.date },
        { $set: { pending: t.pending, completed: t.completed } },
        { upsert: true, new: true }
      );
      results.push(updated);
    }
    res.json(results);
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
