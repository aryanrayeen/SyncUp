import mongoose from "mongoose";

const fitnessLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  calories: { type: Number, required: true },
  exercises: [{ type: String, required: true }],
});

export default mongoose.model