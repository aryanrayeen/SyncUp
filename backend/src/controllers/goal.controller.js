import Goal from "../model/Goal.js";

// Get all goals for a user
export const getAllGoals = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    console.log(`Found ${goals.length} goals for user ${userId}`);
    
    res.status(200).json({ 
      success: true, 
      goals,
      message: "Goals fetched successfully"
    });
  } catch (err) {
    console.error("getAllGoals error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    const { title, date } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required" 
      });
    }

    const goal = new Goal({
      userId,
      title,
      completed: false,
      date: date || new Date().toISOString().slice(0, 10),
    });

    await goal.save();
    console.log("Goal created:", goal);
    
    res.status(201).json({ 
      success: true, 
      goal,
      message: "Goal created successfully" 
    });
  } catch (err) {
    console.error("createGoal error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a goal
export const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.userId;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, userId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        message: "Goal not found or unauthorized" 
      });
    }

    console.log("Goal updated:", goal);
    
    res.status(200).json({ 
      success: true, 
      goal,
      message: "Goal updated successfully" 
    });
  } catch (err) {
    console.error("updateGoal error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const goal = await Goal.findOneAndDelete({ _id: goalId, userId });

    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        message: "Goal not found or unauthorized" 
      });
    }

    console.log("Goal deleted:", goalId);
    
    res.status(200).json({ 
      success: true, 
      message: "Goal deleted successfully" 
    });
  } catch (err) {
    console.error("deleteGoal error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Legacy functions for backward compatibility
export const logGoal = createGoal;

export const getWeeklyGoalSummary = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const goals = await Goal.find({
      userId,
      targetDate: { $gte: weekAgo }
    });
    res.json({ goals });
  } catch (err) {
    console.error("getWeeklyGoalSummary error:", err);
    res.status(500).json({ error: err.message });
  }
};
