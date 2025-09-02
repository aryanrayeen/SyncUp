import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. 'goal_streak_3', 'budget_1_month'
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['goal', 'finance', 'fitness'], required: true },
  requirement: { type: Object, required: true }, // e.g. { streak: 3 }, { months: 1 }, { amount: 1000 }
  icon: { type: String }, // optional: icon name or url
});

export default mongoose.model('Achievement', achievementSchema);
