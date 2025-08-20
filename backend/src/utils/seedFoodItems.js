import mongoose from "mongoose";
import dotenv from "dotenv";
import FoodItem from "../model/FoodItem.js";

dotenv.config();

const foodItems = [
  // Carbs
  { name: "Brown Rice", category: "Carbs", calories: 111, protein: 3 },
  { name: "Oats", category: "Carbs", calories: 68, protein: 2 },
  { name: "Sweet Potato", category: "Carbs", calories: 86, protein: 2 },
  { name: "Whole Wheat Bread", category: "Carbs", calories: 247, protein: 13 },
  { name: "Pasta", category: "Carbs", calories: 131, protein: 5 },

  // Proteins
  { name: "Chicken Breast", category: "Proteins", calories: 165, protein: 31 },
  { name: "Eggs", category: "Proteins", calories: 155, protein: 13 },
  { name: "Beef", category: "Proteins", calories: 250, protein: 26 },
  { name: "Tuna", category: "Proteins", calories: 132, protein: 28 },

  // Fruits
  { name: "Apple", category: "Fruits", calories: 52, protein: 0.3 },
  { name: "Banana", category: "Fruits", calories: 89, protein: 1.1 },
  { name: "Blueberries", category: "Fruits", calories: 57, protein: 0.7 },
  { name: "Orange", category: "Fruits", calories: 47, protein: 0.9 },
  { name: "Pineapple", category: "Fruits", calories: 50, protein: 0.5 },

  // Vegetables
  { name: "Broccoli", category: "Vegetables", calories: 34, protein: 3 },
  { name: "Carrots", category: "Vegetables", calories: 41, protein: 1 },
  { name: "Tomatoes", category: "Vegetables", calories: 18, protein: 1 },
  { name: "Spinach", category: "Vegetables", calories: 23, protein: 2.9 },
  { name: "Capsicum", category: "Vegetables", calories: 31, protein: 1 },

  // Dairy
  { name: "Milk", category: "Dairy", calories: 42, protein: 3.4 },
  { name: "Yogurt", category: "Dairy", calories: 59, protein: 10 },
  { name: "Cheese", category: "Dairy", calories: 402, protein: 25 },

  // Snacks
  { name: "Pizza", category: "Snacks", calories: 266, protein: 11 },
  { name: "Sandwich", category: "Snacks", calories: 250, protein: 8 },
  { name: "Fries", category: "Snacks", calories: 312, protein: 3.4 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await FoodItem.deleteMany({});
    await FoodItem.insertMany(foodItems);
    console.log("Food items seeded!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
