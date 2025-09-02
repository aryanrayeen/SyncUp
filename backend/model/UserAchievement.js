import mongoose from 'mongoose';

const userAchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', required: true },
  earnedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 }, // e.g. streak count, amount saved, etc.
});

export default mongoose.model('UserAchievement', userAchievementSchema);
