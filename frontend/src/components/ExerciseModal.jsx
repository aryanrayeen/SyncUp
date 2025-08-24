import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const ExerciseModal = ({ isOpen, onClose, exercise, workoutPlans, onAddToWorkoutPlan }) => {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [exerciseData, setExerciseData] = useState({
    sets: 3,
    reps: 10,
    weight: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setIsLoading(true);
    try {
      await onAddToWorkoutPlan(selectedPlanId, {
        exerciseId: exercise._id,
        ...exerciseData
      });
      onClose();
    } catch (error) {
      console.error('Error adding exercise:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (field, value) => {
    setExerciseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const incrementValue = (field, increment = 1) => {
    setExerciseData(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + increment)
    }));
  };

  if (!isOpen || !exercise) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Add Exercise to Workout Plan</h3>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-lg text-primary">{exercise.name}</h4>
            <p className="text-sm text-base-content/70 mb-2">{exercise.description}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="label">
                <span className="label-text">Select Workout Plan</span>
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="">Choose a workout plan...</option>
                {workoutPlans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Sets</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => incrementValue('sets', -1)}
                    className="btn btn-sm btn-circle"
                    disabled={exerciseData.sets <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={exerciseData.sets}
                    onChange={(e) => handleValueChange('sets', parseInt(e.target.value) || 1)}
                    className="input input-bordered w-20 text-center"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => incrementValue('sets', 1)}
                    className="btn btn-sm btn-circle"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Reps</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => incrementValue('reps', -1)}
                    className="btn btn-sm btn-circle"
                    disabled={exerciseData.reps <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={exerciseData.reps}
                    onChange={(e) => handleValueChange('reps', parseInt(e.target.value) || 1)}
                    className="input input-bordered w-20 text-center"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => incrementValue('reps', 1)}
                    className="btn btn-sm btn-circle"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Weight (kg)</span>
                </label>
                <input
                  type="number"
                  value={exerciseData.weight}
                  onChange={(e) => handleValueChange('weight', parseFloat(e.target.value) || 0)}
                  className="input input-bordered w-full"
                  min="0"
                  step="0.5"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

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
              disabled={isLoading || !selectedPlanId}
            >
              {isLoading ? 'Adding...' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseModal;
