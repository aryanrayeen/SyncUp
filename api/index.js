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
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || "https://sync-up-v2.vercel.app"]
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

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
  res.json({ 
    message: "SyncUp API is running!",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Catch all for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found", 
    path: req.originalUrl 
  });
});

// Connect to database once
let isConnected = false;

export default async function handler(req, res) {
  // Set CORS headers manually for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://sync-up-v2.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to database if not already connected
    if (!isConnected) {
      await connectDB();
      isConnected = true;
      console.log("Database connected in serverless function");
    }
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}
