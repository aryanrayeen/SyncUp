import express from "express";
import { chatBotReply, getChatbotInfo, chatbotHealthCheck } from "../controllers/chatbot.controller.js";

const router = express.Router();

// Main chat endpoint
router.post("/chat", chatBotReply);

// Get chatbot information and capabilities
router.get("/info", getChatbotInfo);

// Health check endpoint
router.get("/health", chatbotHealthCheck);

// Legacy endpoint for backward compatibility
router.post("/", chatBotReply);

export default router;
