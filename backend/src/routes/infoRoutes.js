import express from 'express';
import { getInfo, updateInfo } from '../controllers/myInfoController.js';
// import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

// Get the latest info
router.get('/', getInfo);

// Create or update info
router.post('/', updateInfo);

export default router;