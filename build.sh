#!/bin/bash
cd frontend
npm ci
# Set production environment variable
export VITE_API_URL="/api"
npm run build
