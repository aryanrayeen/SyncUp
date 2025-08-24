import React from 'react';
import { X, Target, Edit, Trash2 } from 'lucide-react';

const WorkoutPlanDetailsModal = ({ isOpen, onClose, plan, onEdit, onDelete }) => {
  if (!isOpen || !plan) return null;

  // Debug: Log the plan structure
  console.log('WorkoutPlanDetailsModal - plan:', plan);
  console.log('WorkoutPlanDetailsModal - plan.exercises:', plan.exercises);

  const handleEdit = () => {
    onEdit(plan);
    onClose();
  };

  const handleDelete = () => {
    onDelete(plan._id);
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">{plan.name}</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <Target className="w-4 h-4" />
            <span>{plan.exercises.length} exercises</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-3">Exercises:</h4>
          {plan.exercises.length > 0 ? (
            <div className="space-y-3">
              {plan.exercises.map((exercise, index) => {
                // Debug: Log each exercise structure
                console.log(`Exercise ${index}:`, exercise);
                
                // Handle different data structures for exercise name
                const exerciseName = exercise.name || exercise.exercise?.name || exercise.exercise || 'Unknown Exercise';
                
                return (
                  <div key={index} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h5 className="font-medium text-base">{exerciseName}</h5>
                      <div className="text-sm text-base-content/70 mt-1">
                        <div className="flex gap-4">
                          <span><strong>Sets:</strong> {exercise.sets}</span>
                          <span><strong>Reps:</strong> {exercise.reps}</span>
                          {exercise.weight > 0 && (
                            <span><strong>Weight:</strong> {exercise.weight}kg</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
              <p className="text-base-content/60">No exercises added yet</p>
              <p className="text-sm text-base-content/40">Edit this plan to add exercises</p>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button
            onClick={handleEdit}
            className="btn btn-outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Plan
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-error"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Plan
          </button>
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanDetailsModal;
