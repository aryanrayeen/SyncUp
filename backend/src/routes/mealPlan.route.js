import express from "express";
import { getFoodItems, createMealPlan, getMealPlans, getMealPlanById, deleteMealPlan } from "../controllers/mealPlan.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Food items
router.get("/foods", verifyToken, getFoodItems);

// Meal plans
router.post("/", verifyToken, createMealPlan);
router.get("/", verifyToken, getMealPlans);
router.get("/:id", verifyToken, getMealPlanById);
router.delete("/:id", verifyToken, deleteMealPlan);

export default router;
