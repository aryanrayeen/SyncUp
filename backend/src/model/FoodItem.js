import mongoose from "mongoose";

const FoodItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // e.g. Carbs, Proteins, etc.
  calories: { type: Number, required: true }, // per 100g
  protein: { type: Number, required: true }, // per 100g
  servingSize: { type: Number, default: 100 }, // grams per serving
});

export default mongoose.model("FoodItem", FoodItemSchema);
