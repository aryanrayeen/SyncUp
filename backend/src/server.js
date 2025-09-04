import chatbotRoutes from "./routes/chatbot.route.js";
import publicRoutes from "./routes/public.route.js";
import achievementRoutes from "./routes/achievement.route.js";
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
import dayTaskRoutes from "./routes/dayTask.route.js"; // Import dayTask routes

import FoodItem from "./model/FoodItem.js";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - Vercel handles this automatically
dotenv.config();
console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3004;

// CORS Middleware (must be before routes)
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Allow all localhost and 127.0.0.1 origins for development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow your Vercel frontend deployment
      if (origin === 'https://sync-up-v2.vercel.app' || origin.includes('sync-up-v2.vercel.app')) {
        return callback(null, true);
      }
      
      // Allow any Vercel deployments during development
      if (origin.includes('vercel.app')) {
        return callback(null, true);
      }
      
      // Add your custom domain here when you have one
      // if (origin === 'https://yourdomain.com') {
      //   return callback(null, true);
      // }
      
      // For development, allow all for now
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // Reject other origins in production
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // allow sending cookies
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Test endpoint for deployment verification
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// More permissive CORS for public API endpoints
app.use("/api/public", cors({
  origin: true, // Allow all origins for public API
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false // Public API doesn't need credentials
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

// Public API routes (no authentication required)
app.use("/api/public", publicRoutes);

app.use("/api/achievements", achievementRoutes);

import weightRoutes from "./routes/weight.route.js";
app.use("/api/weight", weightRoutes);

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
async function startServer() {
  try {
    await connectDB();
    await autoSeedFoodItems();
    
    // Always start the server for Render deployment
    app.listen(PORT, () => {
      console.log(`Server started on PORT: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database connected: ${process.env.MONGO_URI ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Export the app for potential future use
export default app;
