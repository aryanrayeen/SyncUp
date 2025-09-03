import React, { useEffect, useState } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { Plus, Edit, Trash2, Dumbbell, Target } from 'lucide-react';
import WorkoutPlanModal from '../components/WorkoutPlanModal';
import ExerciseModal from '../components/ExerciseModal';
import WorkoutPlanDetailsModal from '../components/WorkoutPlanDetailsModal';

const categories = [
  { id: 'chest', name: 'Chest', color: 'bg-red-100 border-red-300 text-red-700' },
  { id: 'back', name: 'Back', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: 'shoulders', name: 'Shoulders', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { id: 'biceps', name: 'Biceps', color: 'bg-green-100 border-green-300 text-green-700' },
  { id: 'triceps', name: 'Triceps', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: 'legs', name: 'Legs', color: 'bg-orange-100 border-orange-300 text-orange-700' }
];

const Workouts = () => {
  const {
    exercises,
    workoutPlans,
    isLoading,
    error,
    fetchExercises,
    fetchWorkoutPlans,
    fetchExercisesByCategory,
    deleteWorkoutPlan,
    addExerciseToWorkoutPlan,
    seedExercises,
    clearError
  } = useWorkoutStore();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryExercises, setCategoryExercises] = useState([]);
  const [showWorkoutPlanModal, setShowWorkoutPlanModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

    // Deduplicate categoryExercises by name
    const dedupedCategoryExercises = Object.values(
      categoryExercises.reduce((acc, ex) => {
        acc[ex.name] = ex;
        return acc;
      }, {})
    );
  useEffect(() => {
    fetchExercises();
    fetchWorkoutPlans();
    seedExercises(); // Seed exercises if they don't exist
  }, []);

  useEffect(() => {
    if (error) {
      setTimeout(() => clearError(), 5000);
    }
  }, [error]);

  const handleCategoryClick = async (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedCategory?.id === category.id) {
      // If clicking the same category, collapse it
      setSelectedCategory(null);
      setCategoryExercises([]);
    } else {
      // If clicking a different category, show its exercises
      setSelectedCategory(category);
      const exercises = await fetchExercisesByCategory(category.id);
      setCategoryExercises(exercises);
    }
  };

  const handleCreateWorkoutPlan = () => {
    setEditingPlan(null);
    setShowWorkoutPlanModal(true);
  };

  const handleEditWorkoutPlan = (plan) => {
    setEditingPlan(plan);
    setShowWorkoutPlanModal(true);
  };

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan);
    setShowPlanDetailsModal(true);
  };

  const handleDeleteWorkoutPlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this workout plan?')) {
      try {
        await deleteWorkoutPlan(planId);
      } catch (error) {
        console.error('Error deleting workout plan:', error);
      }
    }
  };

  const handleAddExercise = (exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleAddExerciseToWorkoutPlan = async (planId, exerciseData) => {
    try {
      await addExerciseToWorkoutPlan(planId, exerciseData);
      setShowExerciseModal(false);
      setSelectedExercise(null);
    } catch (error) {
      console.error('Error adding exercise to workout plan:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-full lg:max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content mb-2">Workouts</h1>
        <p className="text-sm sm:text-base text-base-content/70">Create and manage your workout plans</p>
      </div>

      {error && (
        <div className="alert alert-error mb-4 sm:mb-6 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Create Workout Plan Button */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={handleCreateWorkoutPlan}
          className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workout Plan
        </button>
      </div>

      {/* Categories and Exercises */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-base-content mb-3 sm:mb-4">Exercise Categories</h2>
        <div className="space-y-3 sm:space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="card bg-base-200 shadow-sm">
              <div className="card-body p-0">
                <button
                  className="w-full text-left p-3 sm:p-4 hover:bg-base-300 transition-colors border-none bg-transparent text-lg sm:text-xl font-medium flex items-center justify-between"
                  type="button"
                  onClick={(e) => handleCategoryClick(e, category)}
                >
                  <span>{category.name}</span>
                  <svg
                    className={`inline-block ml-2 transition-transform duration-200 ${selectedCategory?.id === category.id ? 'rotate-90' : ''}`}
                    width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 6L13 10L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {selectedCategory?.id === category.id && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {isLoading ? (
                        <div className="col-span-full flex justify-center">
                          <div className="loading loading-spinner"></div>
                        </div>
                      ) : dedupedCategoryExercises.length > 0 ? (
                        dedupedCategoryExercises.map((exercise) => (
                          <div key={exercise._id} className="card bg-base-100 shadow-sm border">
                            <div className="card-body p-3 sm:p-4">
                              <h4 className="font-semibold text-sm sm:text-base break-words">{exercise.name}</h4>
                              <p className="text-xs sm:text-sm text-base-content/70">{exercise.description}</p>
                              <div className="card-actions justify-end mt-2">
                                <button
                                  onClick={() => handleAddExercise(exercise)}
                                  className="btn btn-xs sm:btn-sm btn-primary"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-4">
                          <p className="text-base-content/60 text-sm">No exercises found in this category</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

          {/* Workout Plans */}
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-base-content mb-3 sm:mb-4">Your Workout Plans</h2>
            {workoutPlans.length === 0 ? (
              <div className="card bg-base-200">
                <div className="card-body text-center p-4 sm:p-6">
                  <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-base-content/30 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No workout plans yet</h3>
                  <p className="text-sm sm:text-base text-base-content/70 mb-4">Create your first workout plan to get started</p>
                  <button
                    onClick={handleCreateWorkoutPlan}
                    className="btn btn-primary btn-sm sm:btn-md"
                  >
                    Create Your First Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {workoutPlans.map((plan) => (
                  <div key={plan._id} className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div 
                      className="card-body cursor-pointer hover:bg-base-300 transition-colors p-4 sm:p-6"
                      onClick={() => handlePlanClick(plan)}
                    >
                      <h3 className="card-title text-base sm:text-lg break-words">{plan.name}</h3>
                      
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-base-content/60 mb-4">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{plan.exercises.length} exercises</span>
                        </div>
                      </div>


                      <div className="card-actions justify-end mt-4 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditWorkoutPlan(plan);
                          }}
                          className="btn btn-xs sm:btn-sm btn-outline"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkoutPlan(plan._id);
                          }}
                          className="btn btn-xs sm:btn-sm btn-error"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

      {/* Modals */}
      {showWorkoutPlanModal && (
        <WorkoutPlanModal
          isOpen={showWorkoutPlanModal}
          onClose={() => {
            setShowWorkoutPlanModal(false);
            setEditingPlan(null);
          }}
          editingPlan={editingPlan}
        />
      )}

      {showExerciseModal && selectedExercise && (
        <ExerciseModal
          isOpen={showExerciseModal}
          onClose={() => {
            setShowExerciseModal(false);
            setSelectedExercise(null);
          }}
          exercise={selectedExercise}
          workoutPlans={workoutPlans}
          onAddToWorkoutPlan={handleAddExerciseToWorkoutPlan}
        />
      )}

      {showPlanDetailsModal && selectedPlan && (
        <WorkoutPlanDetailsModal
          isOpen={showPlanDetailsModal}
          onClose={() => {
            setShowPlanDetailsModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onEdit={handleEditWorkoutPlan}
          onDelete={handleDeleteWorkoutPlan}
        />
      )}
    </div>
  );
};

export default Workouts;
