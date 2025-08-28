
import mongoose from 'mongoose';

const DayTaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD (UTC)
  pending: [
    {
      id: String,
      type: String, // 'workout' or 'meal'
      name: String
    }
  ],
  completed: [
    {
      id: String,
      type: String, // 'workout' or 'meal'
      name: String
    }
  ]
}, { timestamps: true });

DayTaskSchema.index({ user: 1, date: 1 }, { unique: true });

const DayTask = mongoose.model('DayTask', DayTaskSchema);
export default DayTask;
