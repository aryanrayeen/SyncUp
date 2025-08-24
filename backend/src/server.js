import chatbotRoutes from "./routes/chatbot.route.js";
import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import fitnessRoutes from "./routes/fitness.route.js";
import financeRoutes from "./routes/finance.route.js";
import goalRoutes from "./routes/goal.route.js";
import authRoutes from "./routes/auth.route.js";
import userInfoRoutes from "./routes/userInfo.route.js";
import workoutRoutes from "./routes/workout.route.js";
import cookieParser from "cookie-parser";
import cors from "cors"; // Import CORS

import mealPlanRoutes from "./routes/mealPlan.route.js";

import FoodItem from "./model/FoodItem.js";

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3004;

// CORS Middleware (must be before routes)
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend's dev URL
    credentials: true, // allow sending cookies
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/fitness", fitnessRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user-info", userInfoRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/workouts", workoutRoutes);

// Meal Plan routes
app.use("/api/meal-plans", mealPlanRoutes);

// Auto-seed food items if collection is empty (dev/demo convenience)
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
  const count = await FoodItem.countDocuments();
  if (count === 0) {
    await FoodItem.insertMany(defaultFoodItems);
    console.log("[AutoSeed] Food items seeded!");
  }
}

// Connect to DB and start server

connectDB().then(async () => {
  await autoSeedFoodItems();
  app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
  });
});
