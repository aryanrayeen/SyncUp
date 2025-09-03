import express from "express";
import { seedWeeklyData } from "../controllers/seedData.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Seed weekly data for testing
router.post("/weekly", verifyToken, seedWeeklyData);

export default router;
