import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useGoalsStore } from '../store/goalsStore';

const Goals = () => {
  const { 
    goals, 
    isLoading, 
    error, 
    fetchGoals, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    toggleGoal,
    getGoalStats,
    clearError 
  } = useGoalsStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: ''
  });

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    try {
      if (editingGoal) {
        await updateGoal(editingGoal._id, { title: formData.title });
        setEditingGoal(null);
      } else {
        await addGoal({ title: formData.title });
      }
      setFormData({ title: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({ title: goal.title });
    setShowAddForm(true);
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId);
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingGoal(null);
    setFormData({ title: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const completedGoals = goals.filter(goal => goal.completed);
  const pendingGoals = goals.filter(goal => !goal.completed);
  const stats = getGoalStats();

  if (isLoading && goals.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Goals & Tasks
              </span>
            </h1>
            <p className="text-base-content/70 mt-2">Track and manage your objectives</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Total Goals</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Completed</p>
                <p className="text-3xl font-bold text-success">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Pending</p>
                <p className="text-3xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Success Rate</p>
                <p className="text-3xl font-bold text-info">{stats.successRate}%</p>
              </div>
              <div 
                className="radial-progress text-info bg-base-300/20 border-base-300/20" 
                style={{ 
                  "--value": stats.successRate,
                  "--size": "4rem",
                  "--thickness": "4px"
                }}
              >
                <span className="text-sm font-bold">{stats.successRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Goal Modal */}
      {showAddForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Goal Title *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Save 1000 taka, Read 10 books, Exercise daily"
                  className="input input-bordered w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  autoFocus
                />
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    editingGoal ? 'Update Goal' : 'Add Goal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Goals */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-warning">
              <Clock className="w-5 h-5" />
              Pending Goals ({pendingGoals.length})
            </h2>
            <div className="space-y-3 mt-4">
              {pendingGoals.map((goal) => (
                <div key={goal._id} className="p-4 bg-base-100 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleGoal(goal._id)}
                        className="checkbox checkbox-primary"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-base-content">{goal.title}</h3>
                        <div className="text-sm text-base-content/60 mt-1">
                          Created: {formatDate(goal.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEdit(goal)}
                        className="btn btn-ghost btn-sm"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(goal._id)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingGoals.length === 0 && (
                <div className="text-center py-8">
                  <Target className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                  <p className="text-base-content/50">No pending goals</p>
                  <p className="text-sm text-base-content/40">All caught up! Add a new goal to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completed Goals */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-success">
              <CheckCircle className="w-5 h-5" />
              Completed Goals ({completedGoals.length})
            </h2>
            <div className="space-y-3 mt-4">
              {completedGoals.map((goal) => (
                <div key={goal._id} className="p-4 bg-base-100 rounded-lg border-l-4 border-success">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleGoal(goal._id)}
                        className="checkbox checkbox-success"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-base-content line-through opacity-75">
                          {goal.title}
                        </h3>
                        <div className="text-sm text-base-content/60 mt-1">
                          Completed: {goal.completionDate ? formatDate(goal.completionDate) : formatDate(goal.updatedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <button 
                        onClick={() => handleDelete(goal._id)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {completedGoals.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                  <p className="text-base-content/50">No completed goals yet</p>
                  <p className="text-sm text-base-content/40">Keep working towards your goals!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
