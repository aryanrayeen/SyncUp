import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import {
  getAllExercises,
  getExercisesByCategory,
  createWorkoutPlan,
  getUserWorkoutPlans,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  addExerciseToWorkoutPlan,
  removeExerciseFromWorkoutPlan,
  seedExercises
} from '../controllers/workout.controller.js';

const router = express.Router();

// Public routes
router.get('/exercises', getAllExercises);
router.get('/exercises/category/:category', getExercisesByCategory);
router.post('/seed-exercises', seedExercises);

// Protected routes
router.use(verifyToken);

router.post('/plans', createWorkoutPlan);
router.get('/plans', getUserWorkoutPlans);
router.put('/plans/:id', updateWorkoutPlan);
router.delete('/plans/:id', deleteWorkoutPlan);
router.post('/plans/:id/exercises', addExerciseToWorkoutPlan);
router.delete('/plans/:id/exercises/:exerciseId', removeExerciseFromWorkoutPlan);

export default router;
