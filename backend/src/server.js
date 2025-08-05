import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import fitnessRoutes from "./routes/fitness.route.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors"; // ✅ Import CORS

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3004;

// ✅ CORS Middleware (must be before routes)
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
app.use("/api/auth", authRoutes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server started on PORT: ${PORT}`);
  });
});
