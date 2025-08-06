import React, { useState } from 'react';
import { Target, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useFitnessStore } from '../store/fitnessStore';

const Goals = () => {
  const { goals, toggleGoal, addGoal } = useFitnessStore();
  const [newGoal, setNewGoal] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (newGoal.trim()) {
      addGoal(newGoal.trim());
      setNewGoal('');
      setShowAddForm(false);
    }
  };

  const completedGoals = goals.filter(goal => goal.completed);
  const pendingGoals = goals.filter(goal => !goal.completed);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Goals</h1>
            <p className="text-base-content/70 mt-2">Track and manage your daily objectives</p>
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

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Total Goals</p>
                <p className="text-3xl font-bold">{goals.length}</p>
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
                <p className="text-3xl font-bold text-success">{completedGoals.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Success Rate</p>
                <p className="text-3xl font-bold text-info">
                  {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
                </p>
              </div>
              <div className="radial-progress text-info" style={{ "--value": goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0 }}>
                {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Goal</h3>
            <form onSubmit={handleAddGoal}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Goal Description</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your goal..."
                  className="input input-bordered w-full"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Goal
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
              Pending Goals ({pendingGoals.length})
            </h2>
            <div className="space-y-3 mt-4">
              {pendingGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleGoal(goal.id)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="text-base-content">{goal.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-sm text-error">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {pendingGoals.length === 0 && (
                <p className="text-center text-base-content/50 py-8">
                  No pending goals. Great job!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Completed Goals */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-success">
              Completed Goals ({completedGoals.length})
            </h2>
            <div className="space-y-3 mt-4">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleGoal(goal.id)}
                      className="checkbox checkbox-success"
                    />
                    <span className="text-base-content line-through opacity-60">{goal.title}</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              ))}
              {completedGoals.length === 0 && (
                <p className="text-center text-base-content/50 py-8">
                  No completed goals yet. Keep going!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
