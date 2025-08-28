import express from "express";
import { logFitness, getWeeklyFitnessSummary } from "../controllers/fitness.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/log", verifyToken, logFitness);
router.get("/summary/weekly", verifyToken, getWeeklyFitnessSummary);

export default router;