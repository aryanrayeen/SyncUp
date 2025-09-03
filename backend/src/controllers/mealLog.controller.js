import MealLog from "../model/MealLog.js";
import MealPlan from "../model/MealPlan.js";

// Log a meal plan for a specific date
export const logMeal = async (req, res) => {
  try {
    const { mealPlanId, date } = req.body;
    const user = req.userId;

    if (!mealPlanId || !date) {
      return res.status(400).json({ error: "Meal plan ID and date are required" });
    }

    // Get the meal plan to extract calories
    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    // Upsert meal log (update if exists, create if doesn't)
    const mealLog = await MealLog.findOneAndUpdate(
      { user, date },
      { 
        mealPlan: mealPlanId,
        totalCalories: mealPlan.calories 
      },
      { upsert: true, new: true }
    ).populate('mealPlan');

    res.json(mealLog);
  } catch (err) {
    console.error("logMeal error:", err);
    res.status(500).json({ error: "Failed to log meal" });
  }
};

// Get weekly meal logs for calorie tracking
export const getWeeklyMealLogs = async (req, res) => {
  try {
    const user = req.userId;
    
    // Get last 7 days
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);

    const logs = await MealLog.find({
      user,
      date: {
        $gte: weekAgo.toISOString().split('T')[0],
        $lte: today.toISOString().split('T')[0]
      }
    }).populate('mealPlan');

    // Create array for all 7 days with 0 calories for missing days
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const log = logs.find(l => l.date === dateStr);
      weeklyData.push({
        date: dateStr,
        totalCalories: log ? log.totalCalories : 0,
        mealPlan: log ? log.mealPlan : null
      });
    }

    res.json({ weeklyData });
  } catch (err) {
    console.error("getWeeklyMealLogs error:", err);
    res.status(500).json({ error: "Failed to fetch weekly meal logs" });
  }
};

// Get meal log for a specific date
export const getMealLogByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const user = req.userId;

    const log = await MealLog.findOne({ user, date }).populate('mealPlan');
    
    if (!log) {
      return res.status(404).json({ error: "No meal log found for this date" });
    }

    res.json(log);
  } catch (err) {
    console.error("getMealLogByDate error:", err);
    res.status(500).json({ error: "Failed to fetch meal log" });
  }
};

// Delete meal log for a specific date
export const deleteMealLog = async (req, res) => {
  try {
    const { date } = req.params;
    const user = req.userId;

    const deleted = await MealLog.findOneAndDelete({ user, date });
    
    if (!deleted) {
      return res.status(404).json({ error: "No meal log found for this date" });
    }

    res.json({ message: "Meal log deleted successfully" });
  } catch (err) {
    console.error("deleteMealLog error:", err);
    res.status(500).json({ error: "Failed to delete meal log" });
  }
};
