import express from "express";
import { 
  getAllFinanceLogs,
  createFinanceLog,
  updateFinanceLog,
  deleteFinanceLog,
  getMonthlyReport,
  updateMonthlyBudget,
  logFinance, 
  getWeeklyFinanceSummary 
} from "../controllers/finance.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// New comprehensive routes
router.get("/", verifyToken, getAllFinanceLogs);
router.post("/", verifyToken, createFinanceLog);
router.put("/:logId", verifyToken, updateFinanceLog);
router.delete("/:logId", verifyToken, deleteFinanceLog);
router.get("/report/monthly", verifyToken, getMonthlyReport);
router.put("/budget/monthly", verifyToken, updateMonthlyBudget);

// Legacy routes for backward compatibility
router.post("/log", verifyToken, logFinance);
router.get("/summary/weekly", verifyToken, getWeeklyFinanceSummary);

export default router;
