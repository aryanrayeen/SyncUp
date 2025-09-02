import express from 'express';
import { getWeightHistory } from '../controllers/weight.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/history', verifyToken, getWeightHistory);

export default router;
