import { Exercise, WorkoutPlan } from '../model/Workout.js';

// Get all exercises
export const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ category: 1, name: 1 });
    res.json({ success: true, exercises });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exercises' });
  }
};

// Get exercises by category
export const getExercisesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const exercises = await Exercise.find({ category }).sort({ name: 1 });
    res.json({ success: true, exercises });
  } catch (error) {
    console.error('Error fetching exercises by category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exercises' });
  }
};

// Create a new workout plan
export const createWorkoutPlan = async (req, res) => {
  try {
    console.log('Backend: Creating workout plan');
    console.log('Backend: Request body:', req.body);
    console.log('Backend: User ID:', req.userId);
    
    const { name, exercises } = req.body;
    const userId = req.userId;

    const workoutPlan = new WorkoutPlan({
      userId,
      name,
      exercises
    });

    console.log('Backend: Saving workout plan:', workoutPlan);
    await workoutPlan.save();
    await workoutPlan.populate('exercises.exercise');

    console.log('Backend: Workout plan saved successfully');
    res.status(201).json({ success: true, workoutPlan });
  } catch (error) {
    console.error('Backend: Error creating workout plan:', error);
    res.status(500).json({ success: false, message: 'Failed to create workout plan' });
  }
};

// Get user's workout plans
export const getUserWorkoutPlans = async (req, res) => {
  try {
    const userId = req.userId;
    const workoutPlans = await WorkoutPlan.find({ userId })
      .populate('exercises.exercise')
      .sort({ createdAt: -1 });

    res.json({ success: true, workoutPlans });
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workout plans' });
  }
};

// Update workout plan
export const updateWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    ).populate('exercises.exercise');

    if (!workoutPlan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    res.json({ success: true, workoutPlan });
  } catch (error) {
    console.error('Error updating workout plan:', error);
    res.status(500).json({ success: false, message: 'Failed to update workout plan' });
  }
};

// Delete workout plan
export const deleteWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const workoutPlan = await WorkoutPlan.findOneAndDelete({ _id: id, userId });

    if (!workoutPlan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    res.json({ success: true, message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    res.status(500).json({ success: false, message: 'Failed to delete workout plan' });
  }
};

// Add exercise to workout plan
export const addExerciseToWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { exerciseId, sets, reps, weight } = req.body;

    const workoutPlan = await WorkoutPlan.findOne({ _id: id, userId });

    if (!workoutPlan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    const exerciseData = {
      exercise: exerciseId,
      sets: sets || 3,
      reps: reps || 10,
      weight: weight || 0
    };

    workoutPlan.exercises.push(exerciseData);
    await workoutPlan.save();
    await workoutPlan.populate('exercises.exercise');

    res.json({ success: true, workoutPlan });
  } catch (error) {
    console.error('Error adding exercise to workout plan:', error);
    res.status(500).json({ success: false, message: 'Failed to add exercise to workout plan' });
  }
};

// Remove exercise from workout plan
export const removeExerciseFromWorkoutPlan = async (req, res) => {
  try {
    const { id, exerciseId } = req.params;
    const userId = req.userId;

    const workoutPlan = await WorkoutPlan.findOne({ _id: id, userId });

    if (!workoutPlan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    workoutPlan.exercises = workoutPlan.exercises.filter(
      exercise => exercise._id.toString() !== exerciseId
    );

    await workoutPlan.save();
    await workoutPlan.populate('exercises.exercise');

    res.json({ success: true, workoutPlan });
  } catch (error) {
    console.error('Error removing exercise from workout plan:', error);
    res.status(500).json({ success: false, message: 'Failed to remove exercise from workout plan' });
  }
};

// Seed initial exercises
export const seedExercises = async (req, res) => {
  try {
    const exercisesData = [
      // Chest exercises
      { name: 'Push-ups', category: 'chest', description: 'Classic bodyweight chest exercise' },
      { name: 'Bench Press', category: 'chest', description: 'Barbell chest exercise' },
      { name: 'Incline Dumbbell Press', category: 'chest', description: 'Upper chest targeting exercise' },
      { name: 'Chest Dips', category: 'chest', description: 'Bodyweight chest and tricep exercise' },
      
      // Back exercises
      { name: 'Pull-ups', category: 'back', description: 'Bodyweight back exercise' },
      { name: 'Deadlifts', category: 'back', description: 'Compound back and leg exercise' },
      { name: 'Bent-over Rows', category: 'back', description: 'Barbell back exercise' },
      { name: 'Lat Pulldowns', category: 'back', description: 'Cable back exercise' },
      
      // Shoulders exercises
      { name: 'Shoulder Press', category: 'shoulders', description: 'Overhead pressing movement' },
      { name: 'Lateral Raises', category: 'shoulders', description: 'Side deltoid isolation' },
      { name: 'Front Raises', category: 'shoulders', description: 'Front deltoid isolation' },
      { name: 'Reverse Flyes', category: 'shoulders', description: 'Rear deltoid exercise' },
      
      // Biceps exercises
      { name: 'Bicep Curls', category: 'biceps', description: 'Basic bicep exercise' },
      { name: 'Hammer Curls', category: 'biceps', description: 'Neutral grip bicep exercise' },
      { name: 'Chin-ups', category: 'biceps', description: 'Bodyweight bicep exercise' },
      { name: 'Preacher Curls', category: 'biceps', description: 'Isolated bicep exercise' },
      
      // Triceps exercises
      { name: 'Tricep Dips', category: 'triceps', description: 'Bodyweight tricep exercise' },
      { name: 'Close-grip Push-ups', category: 'triceps', description: 'Tricep-focused push-up variation' },
      { name: 'Overhead Tricep Extension', category: 'triceps', description: 'Isolation tricep exercise' },
      { name: 'Tricep Kickbacks', category: 'triceps', description: 'Dumbbell tricep isolation' },
      
      // Legs exercises
      { name: 'Squats', category: 'legs', description: 'Compound leg exercise' },
      { name: 'Lunges', category: 'legs', description: 'Single-leg compound exercise' },
      { name: 'Leg Press', category: 'legs', description: 'Machine-based leg exercise' },
      { name: 'Romanian Deadlifts', category: 'legs', description: 'Hamstring-focused exercise' }
    ];

    // Remove duplicates based on name and category
    const uniqueExercises = [];
    const seenExercises = new Set();
    
    for (const exercise of exercisesData) {
      const key = `${exercise.name}-${exercise.category}`;
      if (!seenExercises.has(key)) {
        seenExercises.add(key);
        
        // Check if exercise already exists in database
        const existing = await Exercise.findOne({ 
          name: exercise.name, 
          category: exercise.category 
        });
        
        if (!existing) {
          uniqueExercises.push(exercise);
        }
      }
    }

    if (uniqueExercises.length === 0) {
      return res.json({ success: true, message: 'No new exercises to seed' });
    }

    await Exercise.insertMany(uniqueExercises);
    res.json({ 
      success: true, 
      message: `${uniqueExercises.length} exercises seeded successfully` 
    });
  } catch (error) {
    console.error('Error seeding exercises:', error);
    res.status(500).json({ success: false, message: 'Failed to seed exercises' });
  }
};
