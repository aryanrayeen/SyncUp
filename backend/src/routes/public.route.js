import express from "express";
import { chatBotReply, getChatbotInfo, chatbotHealthCheck } from "../controllers/chatbot.controller.js";

const router = express.Router();

// Simple rate limiting middleware (without external dependency)
const requestCounts = new Map();
const publicChatLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 50;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
      success: false
    });
  }

  validRequests.push(now);
  requestCounts.set(ip, validRequests);
  next();
};

// Apply rate limiting to chat endpoints
router.use("/chat", publicChatLimit);

// Public chatbot endpoints
router.post("/chat", chatBotReply);
router.get("/chat/info", getChatbotInfo);
router.get("/chat/health", chatbotHealthCheck);

// API documentation endpoint
router.get("/docs", (req, res) => {
  const apiDocs = {
    name: "SyncUp Public API",
    version: "1.0.0",
    description: "Public API for SyncUp wellness platform chatbot",
    baseUrl: `${req.protocol}://${req.get('host')}/api/public`,
    endpoints: {
      "POST /chat": {
        description: "Send a message to the SyncUp AI chatbot",
        body: {
          message: "string (required) - Your message to the chatbot",
          sessionId: "string (optional) - Session identifier for conversation tracking",
          context: "object (optional) - Additional context about user's current state"
        },
        response: {
          reply: "string - The chatbot's response",
          success: "boolean - Whether the request was successful",
          sessionId: "string - Session identifier",
          timestamp: "string - ISO timestamp of the response"
        }
      },
      "GET /chat/info": {
        description: "Get information about the chatbot capabilities",
        response: {
          success: "boolean",
          data: {
            name: "string",
            description: "string",
            capabilities: "array",
            commonQuestions: "array",
            version: "string"
          }
        }
      },
      "GET /chat/health": {
        description: "Check the health status of the chatbot service",
        response: {
          success: "boolean",
          status: "string",
          geminiApi: "string",
          timestamp: "string"
        }
      },
      "GET /docs": {
        description: "Get this API documentation"
      }
    },
    rateLimits: {
      chat: "50 requests per 15 minutes per IP"
    },
    authentication: "None required for public endpoints"
  };

  res.json(apiDocs);
});

export default router;
