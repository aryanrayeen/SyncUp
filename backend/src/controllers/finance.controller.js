import FinanceLog from "../model/FinanceLog.js";
import { User } from "../model/usermodel.js";

// Get all finance logs for a user with optional filtering
export const getAllFinanceLogs = async (req, res) => {
  try {
    const userId = req.userId;
    const { month, year, type, category } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    let query = { userId };
    
    // Add date filtering if month/year provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Add type filtering
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }
    
    // Add category filtering
    if (category) {
      query.category = category;
    }

    const logs = await FinanceLog.find(query).sort({ date: -1, createdAt: -1 });
    console.log(`Found ${logs.length} finance logs for user ${userId}`);
    
    res.status(200).json({ 
      success: true, 
      logs,
      message: "Finance logs fetched successfully"
    });
  } catch (err) {
    console.error("getAllFinanceLogs error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new finance log (income or expense)
export const createFinanceLog = async (req, res) => {
  try {
    const { date, amount, type, category, description } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    if (!date || !amount || !type || !category) {
      return res.status(400).json({ 
        success: false, 
        message: "Date, amount, type, and category are required" 
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: "Type must be 'income' or 'expense'" 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Amount must be greater than 0" 
      });
    }

    const log = new FinanceLog({
      userId,
      date: new Date(date),
      amount: parseFloat(amount),
      type,
      category,
      description: description || '',
    });

    await log.save();
    console.log("Finance log created:", log);
    
    res.status(201).json({ 
      success: true, 
      log,
      message: "Finance log created successfully" 
    });
  } catch (err) {
    console.error("createFinanceLog error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a finance log
export const updateFinanceLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const userId = req.userId;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    // Validate type if provided
    if (updates.type && !['income', 'expense'].includes(updates.type)) {
      return res.status(400).json({ 
        success: false, 
        message: "Type must be 'income' or 'expense'" 
      });
    }

    // Validate amount if provided
    if (updates.amount && updates.amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Amount must be greater than 0" 
      });
    }

    const log = await FinanceLog.findOneAndUpdate(
      { _id: logId, userId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!log) {
      return res.status(404).json({ 
        success: false, 
        message: "Finance log not found or unauthorized" 
      });
    }

    console.log("Finance log updated:", log);
    
    res.status(200).json({ 
      success: true, 
      log,
      message: "Finance log updated successfully" 
    });
  } catch (err) {
    console.error("updateFinanceLog error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a finance log
export const deleteFinanceLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const log = await FinanceLog.findOneAndDelete({ _id: logId, userId });

    if (!log) {
      return res.status(404).json({ 
        success: false, 
        message: "Finance log not found or unauthorized" 
      });
    }

    console.log("Finance log deleted:", logId);
    
    res.status(200).json({ 
      success: true, 
      message: "Finance log deleted successfully" 
    });
  } catch (err) {
    console.error("deleteFinanceLog error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get monthly report
export const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { month, year } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const logs = await FinanceLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    // Calculate totals
    const income = logs.filter(log => log.type === 'income');
    const expenses = logs.filter(log => log.type === 'expense');
    
    const totalIncome = income.reduce((sum, log) => sum + log.amount, 0);
    const totalExpenses = expenses.reduce((sum, log) => sum + log.amount, 0);
    const netAmount = totalIncome - totalExpenses;

    // Category breakdown for expenses
    const expensesByCategory = {};
    expenses.forEach(log => {
      if (!expensesByCategory[log.category]) {
        expensesByCategory[log.category] = 0;
      }
      expensesByCategory[log.category] += log.amount;
    });

    // Category breakdown for income
    const incomeByCategory = {};
    income.forEach(log => {
      if (!incomeByCategory[log.category]) {
        incomeByCategory[log.category] = 0;
      }
      incomeByCategory[log.category] += log.amount;
    });

    res.status(200).json({
      success: true,
      report: {
        month: currentMonth,
        year: currentYear,
        totalIncome,
        totalExpenses,
        netAmount,
        expensesByCategory,
        incomeByCategory,
        transactionCount: logs.length,
        logs
      },
      message: "Monthly report generated successfully"
    });
  } catch (err) {
    console.error("getMonthlyReport error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update user's monthly budget
export const updateMonthlyBudget = async (req, res) => {
  try {
    const userId = req.userId;
    const { monthlyBudget } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    if (!monthlyBudget || monthlyBudget <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Monthly budget must be greater than 0" 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { monthlyBudget: parseFloat(monthlyBudget) },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log("Monthly budget updated:", { userId, monthlyBudget });
    
    res.status(200).json({ 
      success: true, 
      monthlyBudget: user.monthlyBudget,
      message: "Monthly budget updated successfully" 
    });
  } catch (err) {
    console.error("updateMonthlyBudget error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Legacy functions for backward compatibility
export const logFinance = createFinanceLog;

export const getWeeklyFinanceSummary = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const logs = await FinanceLog.find({
      userId,
      date: { $gte: weekAgo }
    });
    res.json({ logs });
  } catch (err) {
    console.error("getWeeklyFinanceSummary error:", err);
    res.status(500).json({ error: err.message });
  }
};
