// Seed some achievement definitions for testing
import mongoose from 'mongoose';
import Achievement from '../model/Achievement.js';
import dotenv from 'dotenv';
dotenv.config();

const achievements = [
  {
    key: 'goal_streak_3',
    name: 'Goal Streak: 3 Days',
    description: 'Complete all your goals for 3 days in a row.',
    type: 'goal',
    requirement: { streak: 3 },
    icon: '🔥',
  },
  {
    key: 'goal_streak_5',
    name: 'Goal Streak: 5 Days',
    description: 'Complete all your goals for 5 days in a row.',
    type: 'goal',
    requirement: { streak: 5 },
    icon: '🔥',
  },
  {
    key: 'budget_1_month',
    name: 'Budget Master: 1 Month',
    description: 'Stay within budget for 1 month.',
    type: 'finance',
    requirement: { months: 1 },
    icon: '💰',
  },
  {
    key: 'fitness_streak_3',
    name: 'Fitness Streak: 3 Days',
    description: 'Complete all fitness tasks for 3 days in a row.',
    type: 'fitness',
    requirement: { streak: 3 },
    icon: '🏋️',
  },
  {
    key: 'save_1000',
    name: 'Save 1000',
    description: 'Save a total of 1000.',
    type: 'finance',
    requirement: { amount: 1000 },
    icon: '💵',
  },
  {
    key: 'earn_1000',
    name: 'Earn 1000',
    description: 'Earn a total of 1000.',
    type: 'finance',
    requirement: { amount: 1000 },
    icon: '💸',
  },
];

async function seedAchievements() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const ach of achievements) {
    await Achievement.updateOne({ key: ach.key }, ach, { upsert: true });
  }
  console.log('Achievements seeded!');
  await mongoose.disconnect();
}

seedAchievements();
