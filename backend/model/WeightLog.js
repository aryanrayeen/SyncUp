import mongoose from 'mongoose';

const WeightLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('WeightLog', WeightLogSchema);
