import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Plus } from 'lucide-react';
import { useWorkoutStore } from '../store/workoutStore';
import { useFitnessStore } from '../store/fitnessStore';

import api from '../lib/axios';
import useDayTasks, { formatDateUTC } from '../lib/useDayTasks';

const Fitness = () => {
  // Use shared dayTasks state
  const { dayTasks, addPending, complete, uncomplete, remove } = useDayTasks();
  const [showPopup, setShowPopup] = useState(false);
  // Always use a date string for selectedDate to avoid timezone issues
  const [selectedDate, setSelectedDate] = useState(() => formatDateUTC(new Date()));
  const [mealPlans, setMealPlans] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [errorMeals, setErrorMeals] = useState(null);

  // Workout plans from store
  const { workoutPlans, fetchWorkoutPlans, isLoading: loadingWorkouts, error: errorWorkouts } = useWorkoutStore();
  const { userInfo, weightHistory } = useFitnessStore();

  // Fetch meal plans on mount
  useEffect(() => {
    const fetchMeals = async () => {
      setLoadingMeals(true);
      try {
        const res = await api.get('/meal-plans');
        setMealPlans(res.data);
        setErrorMeals(null);
      } catch (err) {
        setErrorMeals('Failed to load saved meal plans');
      } finally {
        setLoadingMeals(false);
      }
    };
    fetchMeals();
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);

  // Calculate current and previous weight
  const currentWeight = userInfo?.weight || 0;
  const lastWeight = weightHistory?.length > 1 ? weightHistory[weightHistory.length - 2]?.weight : currentWeight;
  const weightChange = currentWeight - lastWeight;
  const weightChangeColor = weightChange > 0 ? 'text-success' : weightChange < 0 ? 'text-error' : 'text-base-content';

  // All items available to add
  const savedItems = [
    ...workoutPlans.map((w) => ({ id: w._id, type: 'workout', name: w.name || w.title || 'Workout Plan' })),
    ...mealPlans.map((m) => ({ id: m._id, type: 'meal', name: m.name || m.title || 'Meal Plan' })),
  ];

  // Get items for selected day
  const dateStr = selectedDate;
  const pending = dayTasks[dateStr]?.pending || [];
  const completed = dayTasks[dateStr]?.completed || [];

  // Add item to pending for selected day
  const handleAddToPending = (item) => {
    addPending(new Date(selectedDate), item);
    setShowPopup(false);
  };

  // Mark as completed
  const handleComplete = (item) => {
    complete(new Date(selectedDate), item);
  };

  // Mark as uncompleted (move back to pending)
  const handleUncomplete = (item) => {
    uncomplete(new Date(selectedDate), item);
  };

  // Remove item from both pending and completed
  const handleDelete = (item) => {
    remove(new Date(selectedDate), item);
  };

  // Change selected date
  const handleDateChange = (date) => {
    setSelectedDate(formatDateUTC(date));
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-full lg:max-w-7xl mx-auto">
      {/* ...existing dashboard content... */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card bg-base-200 shadow-lg p-4 flex flex-col justify-center items-start">
          <div className="font-semibold text-base-content mb-1">Current Weight</div>
          <div className="text-2xl font-bold mb-1">{currentWeight} kg</div>
        </div>
        {/* ...other dashboard cards... */}
      </div>

      {/* --- NEW: Pending/Completed/Calendar Section --- */}
      <div className="mt-8 sm:mt-12 lg:mt-16">
        {/* Debug warning if dateStr not in dayItems */}
        {dayTasks && Object.keys(dayTasks).length > 0 && !dayTasks[dateStr] && (
          <div style={{color:'red',fontWeight:'bold',marginBottom:8}}>
            Warning: No data for selected date ({dateStr}). Existing keys: {Object.keys(dayTasks).join(', ')}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-base-content">Today's Fitness Tasks</h2>
          <button className="btn btn-primary btn-circle btn-sm sm:btn-md" onClick={() => setShowPopup(true)}>
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Pending */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body p-4 sm:p-6">
              <h3 className="card-title text-warning text-base sm:text-lg">Pending</h3>
              <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                {pending.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-base-content/50">
                    <p className="text-sm sm:text-base">No pending items for this day</p>
                  </div>
                ) : (
                  pending.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 bg-base-100 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <input type="checkbox" className="checkbox checkbox-primary" onChange={() => handleComplete(item)} />
                        <span>{item.name} <span className="text-xs text-base-content/40">({item.type})</span></span>
                      </div>
                      <button className="btn btn-xs btn-error" onClick={() => handleDelete(item)}>✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Completed */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-success">Completed</h3>
              <div className="space-y-3 mt-4">
                {completed.length === 0 ? (
                  <div className="text-center py-8 text-base-content/50">No completed items for this day</div>
                ) : (
                  completed.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg border-l-4 border-success">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox checkbox-success" checked readOnly onClick={() => handleUncomplete(item)} />
                        <span className="line-through text-success">{item.name} <span className="text-xs text-base-content/40">({item.type})</span></span>
                      </div>
                      <button className="btn btn-xs btn-error" onClick={() => handleDelete(item)}>✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Calendar */}
        <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col items-center">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-base-content">Calendar</h3>
          <div className="w-full max-w-full overflow-x-auto">
            <Calendar
              onChange={handleDateChange}
              value={new Date(selectedDate)}
              className="rounded-lg shadow-lg bg-base-200 p-2 sm:p-4 mx-auto"
              tileClassName={() => 'text-xs sm:text-base'}
              style={{ 
                width: '100%', 
                maxWidth: '700px', 
                fontSize: window.innerWidth < 640 ? '0.875rem' : '1.15rem',
                minWidth: '280px'
              }}
              tileContent={({ date }) => {
                const dateStr = formatDateUTC(date);
                const tasks = dayTasks[dateStr] || { pending: [], completed: [] };
                const dots = [];
                for (let i = 0; i < tasks.pending.length; i++) {
                  dots.push(<span key={`p${i}`} style={{ display: 'inline-block', width: window.innerWidth < 640 ? 5 : 7, height: window.innerWidth < 640 ? 5 : 7, borderRadius: '50%', background: '#888', margin: 1 }}></span>);
                }
                for (let i = 0; i < tasks.completed.length; i++) {
                  dots.push(<span key={`c${i}`} style={{ display: 'inline-block', width: window.innerWidth < 640 ? 5 : 7, height: window.innerWidth < 640 ? 5 : 7, borderRadius: '50%', background: '#22c55e', margin: 1 }}></span>);
                }
                return <div style={{ marginTop: 2, textAlign: 'center' }}>{dots}</div>;
              }}
            />
          </div>
        </div>
      </div>

      {/* Popup for adding items */}
      {showPopup && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm sm:max-w-md lg:max-w-lg">
            <h3 className="font-bold text-lg mb-4">Add to {new Date(selectedDate).toLocaleDateString()}</h3>
            <div className="space-y-2">
              {(loadingMeals || loadingWorkouts) && <div>Loading...</div>}
              {errorMeals && <div className="text-error text-sm">{errorMeals}</div>}
              {errorWorkouts && <div className="text-error text-sm">{errorWorkouts}</div>}
              {savedItems.length === 0 && !(loadingMeals || loadingWorkouts) && (
                <div className="text-base-content/50 text-sm">No saved meal plans or workout plans found.</div>
              )}
              {savedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 rounded bg-base-100 border-l-4 border-base-300 gap-2">
                  <span className="flex-1 text-sm break-words">{item.name} <span className="text-xs text-base-content/40">({item.type})</span></span>
                  <button className="btn btn-sm btn-primary btn-circle flex-shrink-0" onClick={() => handleAddToPending(item)}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fitness;
