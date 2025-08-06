import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getUserInfo, updateUserInfo, checkProfileCompletion } from '../controllers/myInfoController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Check if user has completed profile
router.get('/profile-completion', checkProfileCompletion);

// Get user's latest information
router.get('/', getUserInfo);

// Create or update user information
router.post('/', updateUserInfo);

export default router;
