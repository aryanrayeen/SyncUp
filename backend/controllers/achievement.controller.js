import Achievement from '../model/Achievement.js';
import UserAchievement from '../model/UserAchievement.js';
import Goal from '../src/model/Goal.js';
import FinanceLog from '../src/model/FinanceLog.js';
import FitnessLog from '../src/model/FitnessLog.js';

// --- Utility functions for progress calculation ---
async function getGoalStreak(userId) {
  // Count consecutive days where all goals are completed
  const goals = await Goal.find({ user: userId });
  // Group by date, check if all completed
  const byDate = {};
  goals.forEach(g => {
    const date = g.date || g.createdAt.toISOString().slice(0, 10);
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(g);
  });
  // Sort dates descending
  const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  for (const date of dates) {
    if (byDate[date].every(g => g.completed)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

async function getBudgetStreak(userId) {
  // Count consecutive months where user stayed in budget
  // For demo: just return 1 (implement real logic later)
  return 1;
}

async function getFitnessStreak(userId) {
  // Count consecutive days where all fitness tasks are completed
  // For demo: just return 1 (implement real logic later)
  return 1;
}

async function getTotalSaved(userId) {
  // Sum all savings transactions
  // For demo: just return 1000
  return 1000;
}

async function getTotalEarned(userId) {
  // Sum all income transactions
  // For demo: just return 1000
  return 1000;
}

// Get all achievements with user's progress
export const getAchievementsForUser = async (req, res) => {
  try {
    const userId = req.userId;
    const achievements = await Achievement.find({});
    const userAchievements = await UserAchievement.find({ user: userId });
    // Map earned achievements for quick lookup
    const earnedMap = {};
    userAchievements.forEach(ua => {
      earnedMap[ua.achievement.toString()] = ua;
    });
    // Calculate progress for each achievement
    const progressMap = {
      goal: await getGoalStreak(userId),
      finance: {
        budget: await getBudgetStreak(userId),
        saved: await getTotalSaved(userId),
        earned: await getTotalEarned(userId),
      },
      fitness: await getFitnessStreak(userId),
    };
    // Build response: earned and locked with progress
    const result = await Promise.all(achievements.map(async ach => {
      let earned = earnedMap[ach._id.toString()];
      let progress = 0;
      let requirement = ach.requirement.streak || ach.requirement.months || ach.requirement.amount;
      if (ach.type === 'goal') progress = progressMap.goal;
      if (ach.type === 'fitness') progress = progressMap.fitness;
      if (ach.type === 'finance') {
        if (ach.key.startsWith('budget')) progress = progressMap.finance.budget;
        else if (ach.key.startsWith('save')) progress = progressMap.finance.saved;
        else if (ach.key.startsWith('earn')) progress = progressMap.finance.earned;
      }
      // If not earned and progress meets requirement, create UserAchievement
      if (!earned && progress >= requirement) {
        earned = await UserAchievement.create({
          user: req.userId,
          achievement: ach._id,
          earnedAt: new Date()
        });
      }
      return {
        _id: ach._id,
        key: ach.key,
        name: ach.name,
        description: ach.description,
        type: ach.type,
        requirement: ach.requirement,
        icon: ach.icon,
        earned: !!earned,
        earnedAt: earned?.earnedAt || null,
        progress,
      };
    }));
    res.json({ achievements: result });
  } catch (err) {
  console.error('Achievements API error:', err);
  res.status(500).json({ message: 'Error fetching achievements', error: err.message });
  }
};
