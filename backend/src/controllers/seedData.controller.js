import MealLog from "../model/MealLog.js";
import FitnessLog from "../model/FitnessLog.js";
import MealPlan from "../model/MealPlan.js";

// Seed data for development/testing
export const seedWeeklyData = async (req, res) => {
  try {
    const user = req.userId;

    if (!user) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Create a sample meal plan if none exists
    let mealPlan = await MealPlan.findOne({ user });
    if (!mealPlan) {
      mealPlan = await MealPlan.create({
        user,
        name: "Sample Healthy Meal",
        items: [],
        calories: 600
      });
    }

    // Create meal logs for the past 7 days
    const mealLogs = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Create random calorie intake between 400-800
      const calories = Math.floor(Math.random() * 400) + 400;
      
      const existingLog = await MealLog.findOne({ user, date: dateStr });
      if (!existingLog) {
        const log = await MealLog.create({
          user,
          mealPlan: mealPlan._id,
          date: dateStr,
          totalCalories: calories
        });
        mealLogs.push(log);
      }
    }

    // Create fitness logs for the past 7 days
    const fitnessLogs = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create random workout data
      const duration = Math.floor(Math.random() * 60) + 20; // 20-80 minutes
      const calories = Math.floor(duration * 5); // ~5 cal per minute
      
      const existingLog = await FitnessLog.findOne({ 
        userId: user, 
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        }
      });
      
      if (!existingLog) {
        const log = await FitnessLog.create({
          userId: user,
          date,
          duration,
          calories,
          exercises: [
            { name: "Sample Workout", duration: duration }
          ]
        });
        fitnessLogs.push(log);
      }
    }

    res.json({ 
      message: "Weekly data seeded successfully",
      mealLogs: mealLogs.length,
      fitnessLogs: fitnessLogs.length
    });
  } catch (err) {
    console.error("seedWeeklyData error:", err);
    res.status(500).json({ error: err.message });
  }
};
