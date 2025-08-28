import express from "express";
import { 
  getAllGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  logGoal, 
  getWeeklyGoalSummary 
} from "../controllers/goal.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// New CRUD routes
router.get("/", verifyToken, getAllGoals);
router.post("/", verifyToken, createGoal);
router.put("/:goalId", verifyToken, updateGoal);
router.delete("/:goalId", verifyToken, deleteGoal);

// Legacy routes for backward compatibility
router.post("/log", verifyToken, logGoal);
router.get("/summary/weekly", verifyToken, getWeeklyGoalSummary);

export default router;
