import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    duration: { type: Number },
    reps: { type: Number },
  },
  { _id: false }
);

const fitnessLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  calories: { type: Number, required: true },
  exercises: [exerciseSchema],
});

export default mongoose.model("FitnessLog", fitnessLogSchema);