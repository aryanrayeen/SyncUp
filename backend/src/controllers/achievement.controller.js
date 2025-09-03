import Achievement from '../../model/Achievement.js';
import UserAchievement from '../../model/UserAchievement.js';
import Goal from '../model/Goal.js';
import FinanceLog from '../model/FinanceLog.js';
import FitnessLog from '../model/FitnessLog.js';

// --- Utility functions for progress calculation ---
async function getGoalStreak(userId) {
  // ...existing code...
}

async function getBudgetStreak(userId) {
  // ...existing code...
}

async function getFitnessStreak(userId) {
  // ...existing code...
}

async function getTotalSaved(userId) {
  // ...existing code...
}

async function getTotalEarned(userId) {
  // ...existing code...
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
      // ...rest of your logic...
      return {
        ...ach.toObject(),
        earned: !!earned,
        progress,
        requirement,
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
