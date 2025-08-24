import React, { useState, useEffect } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { X, Edit, Trash2, Plus, Minus } from 'lucide-react';

const WorkoutPlanModal = ({ isOpen, onClose, editingPlan }) => {
  const { createWorkoutPlan, updateWorkoutPlan, removeExerciseFromWorkoutPlan, isLoading } = useWorkoutStore();
  
  const [formData, setFormData] = useState({
    name: ''
  });
  
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name
      });
      setExercises(editingPlan.exercises || []);
    } else {
      setFormData({
        name: ''
      });
      setExercises([]);
    }
  }, [editingPlan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    try {
      if (editingPlan) {
        console.log('Updating workout plan:', editingPlan._id);
        await updateWorkoutPlan(editingPlan._id, formData);
      } else {
        console.log('Creating new workout plan');
        await createWorkoutPlan(formData);
      }
      console.log('Workout plan saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving workout plan:', error);
    }
  };

  const handleExerciseUpdate = (exerciseId, field, value) => {
    setExercises(exercises.map(ex => 
      ex._id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const handleRemoveExercise = async (exerciseId) => {
    if (editingPlan) {
      try {
        await removeExerciseFromWorkoutPlan(editingPlan._id, exerciseId);
        setExercises(exercises.filter(ex => ex._id !== exerciseId));
      } catch (error) {
        console.error('Error removing exercise:', error);
      }
    } else {
      setExercises(exercises.filter(ex => ex._id !== exerciseId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">
              {editingPlan ? 'Edit Workout Plan' : 'Create New Workout Plan'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="label">
                <span className="label-text">Plan Name</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Enter workout plan name"
                required
              />
            </div>
          </div>

          {editingPlan && exercises.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-4">Exercises in this plan</h4>
              <div className="space-y-4">
                {exercises.map((exercise) => (
                  <div key={exercise._id} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium">{exercise.exercise?.name || 'Unknown Exercise'}</h5>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exercise._id)}
                          className="btn btn-sm btn-error btn-circle"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="label py-1">
                            <span className="label-text text-xs">Sets</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleExerciseUpdate(exercise._id, 'sets', Math.max(1, exercise.sets - 1))}
                              className="btn btn-xs btn-circle"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => handleExerciseUpdate(exercise._id, 'sets', parseInt(e.target.value) || 1)}
                              className="input input-xs input-bordered w-16 text-center"
                              min="1"
                            />
                            <button
                              type="button"
                              onClick={() => handleExerciseUpdate(exercise._id, 'sets', exercise.sets + 1)}
                              className="btn btn-xs btn-circle"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="label py-1">
                            <span className="label-text text-xs">Reps</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleExerciseUpdate(exercise._id, 'reps', Math.max(1, exercise.reps - 1))}
                              className="btn btn-xs btn-circle"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => handleExerciseUpdate(exercise._id, 'reps', parseInt(e.target.value) || 1)}
                              className="input input-xs input-bordered w-16 text-center"
                              min="1"
                            />
                            <button
                              type="button"
                              onClick={() => handleExerciseUpdate(exercise._id, 'reps', exercise.reps + 1)}
                              className="btn btn-xs btn-circle"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="label py-1">
                            <span className="label-text text-xs">Weight (kg)</span>
                          </label>
                          <input
                            type="number"
                            value={exercise.weight}
                            onChange={(e) => handleExerciseUpdate(exercise._id, 'weight', parseFloat(e.target.value) || 0)}
                            className="input input-xs input-bordered w-full"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutPlanModal;
