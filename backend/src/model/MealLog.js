import mongoose from "mongoose";

const MealLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Infos", required: true },
  mealPlan: { type: mongoose.Schema.Types.ObjectId, ref: "MealPlan", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  totalCalories: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one meal log per user per day
MealLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("MealLog", MealLogSchema);
