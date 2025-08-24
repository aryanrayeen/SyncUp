import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs']
  },
  description: {
    type: String,
    default: ''
  },
  instructions: [String],
  muscleGroups: [String],
  equipment: String
}, {
  timestamps: true
});

const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  sets: {
    type: Number,
    required: true,
    default: 3
  },
  reps: {
    type: Number,
    required: true,
    default: 10
  },
  weight: {
    type: Number,
    default: 0
  }
});

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  exercises: [workoutExerciseSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  estimatedDuration: Number // minutes
}, {
  timestamps: true
});

export const Exercise = mongoose.model('Exercise', exerciseSchema);
export const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
