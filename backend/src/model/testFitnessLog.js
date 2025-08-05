import dotenv from "dotenv";
dotenv.config();
console.log("Test script started");
import mongoose from "mongoose";
import FitnessLog from "./FitnessLog.js";

// Use the MongoDB URI from your .env file
const MONGO_URI = process.env.MONGO_URI;
console.log("MONGO_URI:", MONGO_URI);

async function runTest() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Create a sample fitness log
  const log = new FitnessLog({
    userId: new mongoose.Types.ObjectId(), // Replace with a real user ID if you have one
    date: new Date(),
    duration: 30,
    calories: 200,
    exercises: ["Running", "Push-ups"],
  });

  await log.save();
  console.log("Fitness log saved!");

  // Clean up
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

runTest().catch(err => {
  console.error("Error:", err);
  mongoose.disconnect();
});