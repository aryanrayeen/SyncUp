import NewDayTask from '../model/DayTask.js';

// Save or update day tasks for a user and date
export const saveDayTask = async (req, res) => {
  const { userId, date, pending, completed } = req.body;
  if (!userId || !date) return res.status(400).json({ error: 'Missing userId or date' });
  try {
    const updated = await NewDayTask.findOneAndUpdate(
      { user: userId, date },
      { $set: { pending, completed } },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all day tasks for a user
export const getDayTasks = async (req, res) => {
  const { userId } = req.params;
  try {
    const tasks = await NewDayTask.find({ user: userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get day tasks for a user and date
export const getDayTaskByDate = async (req, res) => {
  const { userId, date } = req.params;
  try {
    const task = await NewDayTask.findOne({ user: userId, date });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
