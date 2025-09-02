import express from 'express';
import { getAchievementsForUser } from '../controllers/achievement.controller.js';
import verifyToken from '../src/middleware/verifyToken.js';

const router = express.Router();

// Get all achievements with user progress
router.get('/', verifyToken, getAchievementsForUser);

export default router;
