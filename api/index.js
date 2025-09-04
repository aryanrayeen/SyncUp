// Vercel serverless function - SIMPLIFIED VERSION
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// CORS Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

// Middleware
app.use(express.json());

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

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// Export for Vercel
export default app;
