// Vercel serverless function entry point
import express from "express";
import { connectDB } from "../backend/src/config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import routes
import chatbotRoutes from "../backend/src/routes/chatbot.route.js";
import publicRoutes from "../backend/src/routes/public.route.js";
import achievementRoutes from "../backend/src/routes/achievement.route.js";
import fitnessRoutes from "../backend/src/routes/fitness.route.js";
import financeRoutes from "../backend/src/routes/finance.route.js";
import goalRoutes from "../backend/src/routes/goal.route.js";
import authRoutes from "../backend/src/routes/auth.route.js";
import userInfoRoutes from "../backend/src/routes/userInfo.route.js";
import workoutRoutes from "../backend/src/routes/workout.route.js";
import mealPlanRoutes from "../backend/src/routes/mealPlan.route.js";
import dayTaskRoutes from "../backend/src/routes/dayTask.route.js";
import weightRoutes from "../backend/src/routes/weight.route.js";

// Import models
import FoodItem from "../backend/src/model/FoodItem.js";

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      if (origin.includes('vercel.app') || origin.includes('.vercel.app')) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Test endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'SyncUp Backend API is running!', 
    status: 'success',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'SyncUp API v1.0', 
    status: 'success',
    endpoints: [
      '/api/auth',
      '/api/public',
      '/api/fitness',
      '/api/goals',
      '/api/chatbot'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Public API routes (no authentication required)
app.use("/api/public", cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

// Routes
app.use("/api/fitness", fitnessRoutes);
app.use("/api/day-tasks", dayTaskRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user-info", userInfoRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/weight", weightRoutes);
app.use("/api/meal-plans", mealPlanRoutes);

// Auto-seed food items function
const defaultFoodItems = [
  { name: "Brown Rice", category: "Carbs", calories: 111, protein: 3 },
  { name: "Oats", category: "Carbs", calories: 68, protein: 2 },
  { name: "Sweet Potato", category: "Carbs", calories: 86, protein: 2 },
  { name: "Whole Wheat Bread", category: "Carbs", calories: 247, protein: 13 },
  { name: "Pasta", category: "Carbs", calories: 131, protein: 5 },
  { name: "Chicken Breast", category: "Proteins", calories: 165, protein: 31 },
  { name: "Eggs", category: "Proteins", calories: 155, protein: 13 },
  { name: "Beef", category: "Proteins", calories: 250, protein: 26 },
  { name: "Tuna", category: "Proteins", calories: 132, protein: 28 },
  { name: "Apple", category: "Fruits", calories: 52, protein: 0.3 },
  { name: "Banana", category: "Fruits", calories: 89, protein: 1.1 },
  { name: "Blueberries", category: "Fruits", calories: 57, protein: 0.7 },
  { name: "Orange", category: "Fruits", calories: 47, protein: 0.9 },
  { name: "Pineapple", category: "Fruits", calories: 50, protein: 0.5 },
  { name: "Broccoli", category: "Vegetables", calories: 34, protein: 3 },
  { name: "Carrots", category: "Vegetables", calories: 41, protein: 1 },
  { name: "Tomatoes", category: "Vegetables", calories: 18, protein: 1 },
  { name: "Spinach", category: "Vegetables", calories: 23, protein: 2.9 },
  { name: "Capsicum", category: "Vegetables", calories: 31, protein: 1 },
  { name: "Milk", category: "Dairy", calories: 42, protein: 3.4 },
  { name: "Yogurt", category: "Dairy", calories: 59, protein: 10 },
  { name: "Cheese", category: "Dairy", calories: 402, protein: 25 },
  { name: "Pizza", category: "Snacks", calories: 266, protein: 11 },
  { name: "Sandwich", category: "Snacks", calories: 250, protein: 8 },
  { name: "Fries", category: "Snacks", calories: 312, protein: 3.4 },
];

async function autoSeedFoodItems() {
  try {
    const count = await FoodItem.countDocuments();
    if (count === 0) {
      await FoodItem.insertMany(defaultFoodItems);
      console.log("[AutoSeed] Food items seeded!");
    }
  } catch (error) {
    console.log("Seeding skipped:", error.message);
  }
}

// Connect to database
let dbConnected = false;

async function connectDatabase() {
  if (!dbConnected) {
    try {
      await connectDB();
      await autoSeedFoodItems();
      dbConnected = true;
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection failed:", error);
    }
  }
}

// For Vercel serverless functions, we need to connect to DB on each request
app.use(async (req, res, next) => {
  await connectDatabase();
  next();
});

// Export for Vercel
export default app;
