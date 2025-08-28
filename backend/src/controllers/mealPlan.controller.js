import MealPlan from "../model/MealPlan.js";
import FoodItem from "../model/FoodItem.js";

// Get all food items (optionally by category)
export const getFoodItems = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await FoodItem.find(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch food items" });
  }
};

// Create a new meal plan
export const createMealPlan = async (req, res) => {
  try {
    const { name, items } = req.body;
    const user = req.userId;
    // Calculate total calories for the meal plan
    let totalCalories = 0;
    for (const item of items) {
      const food = await FoodItem.findById(item.food);
      if (food) {
        // calories per 100g * quantity (servings of 100g)
        totalCalories += (food.calories || 0) * (item.quantity || 1);
      }
    }
    if (req.method === 'PUT' && req.params.id) {
      // Update existing meal plan
      const updated = await MealPlan.findOneAndUpdate(
        { _id: req.params.id, user },
        { name, items, calories: totalCalories },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "Meal plan not found" });
      return res.json(updated);
    } else {
      // Create new meal plan
      const mealPlan = await MealPlan.create({ user, name, items, calories: totalCalories });
      res.status(201).json(mealPlan);
    }
  } catch (err) {
    res.status(500).json({ error: req.method === 'PUT' ? "Failed to update meal plan" : "Failed to create meal plan" });
  }
};

// Get all meal plans for the logged-in user
export const getMealPlans = async (req, res) => {
  try {
    const user = req.userId;
    const plans = await MealPlan.find({ user }).populate("items.food");
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch meal plans" });
  }
};

// Get a single meal plan by ID
export const getMealPlanById = async (req, res) => {
  try {
    const plan = await MealPlan.findById(req.params.id).populate("items.food");
    if (!plan) return res.status(404).json({ error: "Meal plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch meal plan" });
  }
};

// Delete a meal plan
export const deleteMealPlan = async (req, res) => {
  try {
    const user = req.userId;
    const plan = await MealPlan.findOneAndDelete({ _id: req.params.id, user });
    if (!plan) return res.status(404).json({ error: "Meal plan not found" });
    res.json({ message: "Meal plan deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete meal plan" });
  }
};
