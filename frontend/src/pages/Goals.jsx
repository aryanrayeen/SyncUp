import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalDate, setModalDate] = useState(null); // for popup
  // --- Calendar modal add-goal state ---
  const [showAddForDate, setShowAddForDate] = useState(false);
  const [addGoalTitle, setAddGoalTitle] = useState("");
  // Use a separate loading state for calendar modal add-goal
  const [isAddingGoalForDate, setIsAddingGoalForDate] = useState(false);

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
        // Always use today's local date for main form
        const todayLocal = new Date();
        const localDateStr = todayLocal.getFullYear() + '-' + String(todayLocal.getMonth() + 1).padStart(2, '0') + '-' + String(todayLocal.getDate()).padStart(2, '0');
        await addGoal({ title: formData.title, date: localDateStr });
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

  // Show only today's goals in the pending/completed boxes
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const isToday = (date) => {
    const d = new Date(date);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };
  const completedGoals = goals.filter(goal => goal.completed && isToday(goal.date || goal.completionDate || goal.updatedAt));
  const pendingGoals = goals.filter(goal => !goal.completed && isToday(goal.date || goal.createdAt));
  // Debug: log all goals and their date fields for troubleshooting
  console.log('All goals:', goals.map(g => ({ title: g.title, date: g.date, createdAt: g.createdAt, completed: g.completed })));
  console.log('Today string:', todayStr);
  console.log('Pending goals for today:', pendingGoals.map(g => ({ title: g.title, date: g.date, createdAt: g.createdAt })));
  // Filter goals for current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthlyGoals = goals.filter(g => {
    const dateObj = g.date ? new Date(g.date) : new Date(g.createdAt);
    return dateObj.getFullYear() === currentYear && dateObj.getMonth() === currentMonth;
  });
  const monthlyCompleted = monthlyGoals.filter(g => g.completed).length;
  const monthlyTotal = monthlyGoals.length;
  const monthlyPending = monthlyTotal - monthlyCompleted;
  const monthlySuccessRate = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;
  const stats = {
    total: monthlyTotal,
    completed: monthlyCompleted,
    pending: monthlyPending,
    successRate: monthlySuccessRate
  };

  if (isLoading && goals.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // Helper: group goals by date (YYYY-MM-DD)
  const goalsByDate = goals.reduce((acc, goal) => {
    // Use the explicit 'date' field if present, otherwise fallback
    const date = goal.date
      ? goal.date
      : new Date(goal.completed ? (goal.completionDate || goal.updatedAt) : goal.createdAt).toISOString().slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(goal);
    return acc;
  }, {});

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Goals & Tasks
              </span>
            </h1>
            <p className="text-sm sm:text-base text-base-content/70 mt-1 sm:mt-2">Track and manage your objectives</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary btn-sm sm:btn-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-4 sm:mb-6 text-sm">
          <span>{error}</span>
        </div>
      )}

  {/* Progress Stats */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
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
                          {goal.date ? `Scheduled: ${formatDate(goal.date)}` : `Created: ${formatDate(goal.createdAt)}`}
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
      {/* Calendar Section */}
      <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col items-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-base-content">Calendar</h2>
        <div className="w-full max-w-full overflow-x-auto">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="rounded-lg shadow-lg bg-base-200 p-2 sm:p-4 mx-auto"
            tileClassName={() => 'text-xs sm:text-base'}
            style={{ 
              width: '100%', 
              maxWidth: '700px', 
              fontSize: window.innerWidth < 640 ? '0.875rem' : '1.15rem',
              minWidth: '280px'
            }}
            tileContent={({ date, view }) => {
              if (view !== 'month') return null;
              // Use local date string (YYYY-MM-DD) for matching
              const localDateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
              const goalsForDay = goalsByDate[localDateStr] || [];
              if (!goalsForDay.length) return null;
              // Show up to 5 dots per row, wrap if more
              const dotRows = [];
              for (let i = 0; i < goalsForDay.length; i += 5) {
                dotRows.push(goalsForDay.slice(i, i + 5));
              }
              return (
                <div className="flex flex-col items-center mt-1 space-y-0.5">
                  {dotRows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex justify-center gap-0.5">
                      {row.map((goal, idx) => (
                        <span
                          key={goal._id || idx}
                          className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-base-300 ${goal.completed ? 'bg-green-500' : 'bg-gray-400'}`}
                          title={goal.title}
                        ></span>
                      ))}
                    </div>
                  ))}
                </div>
              );
            }}
            onClickDay={(date) => {
              setModalDate(date);
            }}
          />
        </div>

        {/* Modal for goals on selected date */}
        {modalDate && (
          <div className="modal modal-open">
            <div className="modal-box max-w-sm sm:max-w-md lg:max-w-lg">
              <h3 className="font-bold text-lg mb-4">Goals for {modalDate.toLocaleDateString()}</h3>
              <div className="space-y-2">
                {(() => {
                  const modalLocalDateStr = modalDate.getFullYear() + '-' + String(modalDate.getMonth() + 1).padStart(2, '0') + '-' + String(modalDate.getDate()).padStart(2, '0');
                  const goalsForModalDay = goalsByDate[modalLocalDateStr] || [];
                  if (goalsForModalDay.length === 0) {
                    return <div className="text-base-content/60">No goals for this day.</div>;
                  }
                  return goalsForModalDay.map((goal) => (
                    <div key={goal._id} className="flex items-center gap-2 p-2 rounded bg-base-100 border-l-4 border-base-300">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleGoal(goal._id)}
                        className={`checkbox ${goal.completed ? 'checkbox-success' : 'checkbox-primary'}`}
                      />
                      <span className={`flex-1 text-sm break-words ${goal.completed ? 'line-through text-success' : ''}`}>{goal.title}</span>
                      <span className="ml-auto text-xs text-base-content/50">{goal.completed ? 'Completed' : 'Pending'}</span>
                    </div>
                  ));
                })()}
              </div>
              {/* Add Goal Inline Form */}
              <div className="mt-4">
                <button
                  className="btn btn-primary btn-sm w-full sm:w-auto"
                  onClick={() => setShowAddForDate(true)}
                  type="button"
                >
                  Add Goal for this Day
                </button>
                {showAddForDate && (
                  <form
                    className="mt-3 flex flex-col gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!addGoalTitle.trim()) return;
                        setIsAddingGoalForDate(true);
                      try {
                        // Use the store's addGoal method for correct state update
                        // Always use modalDate as local date (not UTC)
                        const modalLocal = new Date(modalDate.getFullYear(), modalDate.getMonth(), modalDate.getDate());
                        const modalDateStr = modalLocal.getFullYear() + '-' + String(modalLocal.getMonth() + 1).padStart(2, '0') + '-' + String(modalLocal.getDate()).padStart(2, '0');
                        await addGoal({
                          title: addGoalTitle,
                          date: modalDateStr,
                        });
                        setAddGoalTitle('');
                        setShowAddForDate(false);
                      } catch (err) {
                        // Optionally show error
                      } finally {
                        setIsAddingGoalForDate(false);
                      }
                    }}
                  >
                    <input
                      className="input input-bordered w-full"
                      placeholder="Goal title..."
                      value={addGoalTitle}
                      onChange={e => setAddGoalTitle(e.target.value)}
                      required
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm order-2 sm:order-1"
                        onClick={() => { setShowAddForDate(false); setAddGoalTitle(''); }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm order-1 sm:order-2"
                        disabled={isAddingGoalForDate}
                      >
                        {isAddingGoalForDate ? <span className="loading loading-spinner loading-sm"></span> : 'Add'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className="modal-action">
                <button className="btn" onClick={() => { setModalDate(null); setShowAddForDate(false); setAddGoalTitle(''); }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

// --- Calendar modal add-goal state ---
// Add these hooks at the top-level of the component (after other useState hooks):
// const [showAddForDate, setShowAddForDate] = useState(false);
// const [addGoalTitle, setAddGoalTitle] = useState("");
// const [isLoading, setIsLoading] = useState(false); // if not already present
};

export default Goals;
