import express from "express";
import { logGoal, getWeeklyGoalSummary } from "../controllers/goal.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/log", verifyToken, logGoal);
router.get("/summary/weekly", verifyToken, getWeeklyGoalSummary);

export default router;
