import mongoose from "mongoose";

const MealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Infos", required: true },
  name: { type: String, required: true },
  items: [
    {
      food: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem", required: true },
      quantity: { type: Number, required: true, default: 1 }, // number of servings (100g each)
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("MealPlan", MealPlanSchema);
