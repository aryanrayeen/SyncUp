import express from "express";
import { 
  logMeal, 
  getWeeklyMealLogs, 
  getMealLogByDate, 
  deleteMealLog 
} from "../controllers/mealLog.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Log a meal for a specific date
router.post("/", verifyToken, logMeal);

// Get weekly meal logs for calorie tracking
router.get("/weekly", verifyToken, getWeeklyMealLogs);

// Get meal log for specific date
router.get("/:date", verifyToken, getMealLogByDate);

// Delete meal log for specific date
router.delete("/:date", verifyToken, deleteMealLog);

export default router;
