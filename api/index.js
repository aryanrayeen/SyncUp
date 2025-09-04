// Vercel API function that serves your backend
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../backend/src/config/db.js";

// Import your existing routes
import authRoutes from "../backend/src/routes/auth.route.js";
import publicRoutes from "../backend/src/routes/public.route.js";
import chatbotRoutes from "../backend/src/routes/chatbot.route.js";
import fitnessRoutes from "../backend/src/routes/fitness.route.js";
import financeRoutes from "../backend/src/routes/finance.route.js";
import goalRoutes from "../backend/src/routes/goal.route.js";
import userInfoRoutes from "../backend/src/routes/userInfo.route.js";
import workoutRoutes from "../backend/src/routes/workout.route.js";
import mealPlanRoutes from "../backend/src/routes/mealPlan.route.js";
import dayTaskRoutes from "../backend/src/routes/dayTask.route.js";
import weightRoutes from "../backend/src/routes/weight.route.js";
import achievementRoutes from "../backend/src/routes/achievement.route.js";

import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// CORS for your frontend
app.use(cors({
  origin: ["https://sync-up-v2.vercel.app", "http://localhost:5173"],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Connect to database on cold start
let dbConnected = false;
async function ensureDbConnection() {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log("Database connected");
    } catch (error) {
      console.error("Database connection failed:", error);
    }
  }
}

// Add all your existing routes
app.use("/auth", authRoutes);
app.use("/public", publicRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/fitness", fitnessRoutes);
app.use("/finance", financeRoutes);
app.use("/goals", goalRoutes);
app.use("/user-info", userInfoRoutes);
app.use("/workouts", workoutRoutes);
app.use("/meal-plans", mealPlanRoutes);
app.use("/day-tasks", dayTaskRoutes);
app.use("/weight", weightRoutes);
app.use("/achievements", achievementRoutes);

// Health check
app.get("/", async (req, res) => {
  await ensureDbConnection();
  res.json({ 
    message: "SyncUp API is running!",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
export default async function handler(req, res) {
  await ensureDbConnection();
  return app(req, res);
}
