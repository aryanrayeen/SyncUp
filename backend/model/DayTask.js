
import mongoose from 'mongoose';

const NewDayTaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD (UTC)
  pending: {
    type: [
      new mongoose.Schema(
        {
          id: String,
          type: String,
          name: String,
          calories: Number // Optional, only for meal plans
        },
        { _id: false }
      )
    ],
    default: []
  },
  completed: {
    type: [
      new mongoose.Schema(
        {
          id: String,
          type: String,
          name: String,
          calories: Number // Optional, only for meal plans
        },
        { _id: false }
      )
    ],
    default: []
  }
}, { timestamps: true });

NewDayTaskSchema.index({ user: 1, date: 1 }, { unique: true });

const NewDayTask = mongoose.model('NewDayTask', NewDayTaskSchema, 'newdaytasks');
export default NewDayTask;
