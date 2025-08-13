import express from "express";
import { logFinance, getWeeklyFinanceSummary } from "../controllers/finance.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/log", verifyToken, logFinance);
router.get("/summary/weekly", verifyToken, getWeeklyFinanceSummary);

export default router;
