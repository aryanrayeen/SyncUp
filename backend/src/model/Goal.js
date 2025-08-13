import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  targetDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  completionDate: { type: Date },
});

export default mongoose.model("Goal", goalSchema);
