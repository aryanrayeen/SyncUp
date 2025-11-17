# SyncUp - Main Deployment Configuration

## ✅ Current Stable Version: v1.0-stable

This is the **MAIN** deployment configuration that works reliably on Vercel.

## 📁 Key Configuration Files

### `vercel.json` - Main Deployment Config
```json
{
  "buildCommand": "bash build.sh",
  "outputDirectory": "frontend/dist",
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `build.sh` - Build Script
```bash
#!/bin/bash
cd frontend
npm ci
npm run build
```

### `api/index.js` - Serverless Backend Function
- Entry point for all backend routes
- Includes auth, chatbot, fitness, finance, goals, etc.
- Connected to MongoDB

## 🚀 Deployment Process

1. **Frontend**: React + Vite → builds to `frontend/dist/`
2. **Backend**: Node.js/Express → serverless function at `/api`
3. **Build**: Uses `bash build.sh` command
4. **Routing**: Frontend SPA + API routes configured

## 🔧 Required Environment Variables (Vercel Dashboard)

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production
```

## 📊 Status
- ✅ Frontend: Working and deployed
- ✅ Backend: Serverless function created
- ⏳ Database: Needs environment variables
- 🎯 **This is the MAIN configuration to use going forward**

## 🏷️ Version Tags
- `v1.0-stable` - Current stable deployment configuration

---
**Last Updated**: September 4, 2025
**Commit**: 103cb58
**Status**: MAIN/PRIMARY CONFIGURATION
