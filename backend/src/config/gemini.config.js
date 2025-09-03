import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

// Debug: Check if API key is loaded
console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'No');
console.log('Gemini API Key value:', process.env.GEMINI_API_KEY);

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default ai;