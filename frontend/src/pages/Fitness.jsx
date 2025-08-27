import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Plus } from 'lucide-react';
import { useWorkoutStore } from '../store/workoutStore';
import api from '../lib/axios';

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => date.toISOString().slice(0, 10);

const Fitness = () => {
  // Per-day state: { [dateStr]: { pending: [], completed: [] } }
  const [dayItems, setDayItems] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [errorMeals, setErrorMeals] = useState(null);

  // Workout plans from store
  const { workoutPlans, fetchWorkoutPlans, isLoading: loadingWorkouts, error: errorWorkouts } = useWorkoutStore();

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

  // All items available to add
  const savedItems = [
    ...workoutPlans.map((w) => ({ id: w._id, type: 'workout', name: w.name || w.title || 'Workout Plan' })),
    ...mealPlans.map((m) => ({ id: m._id, type: 'meal', name: m.name || m.title || 'Meal Plan' })),
  ];

  // Get items for selected day
  const dateStr = formatDate(selectedDate);
  const pending = dayItems[dateStr]?.pending || [];
  const completed = dayItems[dateStr]?.completed || [];

  // Add item to pending for selected day
  const handleAddToPending = (item) => {
    setDayItems((prev) => {
      const prevDay = prev[dateStr] || { pending: [], completed: [] };
      // Prevent duplicates
      if (prevDay.pending.some((i) => i.id === item.id)) return prev;
      return {
        ...prev,
        [dateStr]: {
          ...prevDay,
          pending: [...prevDay.pending, item],
        },
      };
    });
    setShowPopup(false);
  };

  // Mark as completed
  const handleComplete = (item) => {
    setDayItems((prev) => {
      const prevDay = prev[dateStr] || { pending: [], completed: [] };
      return {
        ...prev,
        [dateStr]: {
          pending: prevDay.pending.filter((i) => i.id !== item.id),
          completed: [...prevDay.completed, item],
        },
      };
    });
  };

  // Mark as uncompleted (move back to pending)
  const handleUncomplete = (item) => {
    setDayItems((prev) => {
      const prevDay = prev[dateStr] || { pending: [], completed: [] };
      return {
        ...prev,
        [dateStr]: {
          pending: [...prevDay.pending, item],
          completed: prevDay.completed.filter((i) => i.id !== item.id),
        },
      };
    });
  };

  // Change selected date
  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ...existing dashboard content... */}
      {/* Place your dashboard cards, stats, and chart here. */}

      {/* --- NEW: Pending/Completed/Calendar Section --- */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-base-content">Today's Fitness Tasks</h2>
          <button className="btn btn-primary btn-circle" onClick={() => setShowPopup(true)}>
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pending */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-warning">Pending</h3>
              <div className="space-y-3 mt-4">
                {pending.length === 0 ? (
                  <div className="text-center py-8 text-base-content/50">No pending items for this day</div>
                ) : (
                  pending.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox checkbox-primary" onChange={() => handleComplete(item)} />
                        <span>{item.name} <span className="text-xs text-base-content/40">({item.type})</span></span>
                      </div>
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
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Calendar */}
        <div className="mt-10 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-base-content">Calendar</h3>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            className="rounded-lg shadow-lg bg-base-200 p-4"
            tileClassName={() => 'text-base'}
            style={{ width: '700px', fontSize: '1.15rem' }}
          />
        </div>
      </div>

      {/* Popup for adding items */}
      {showPopup && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add to {selectedDate.toLocaleDateString()}</h3>
            <div className="space-y-2">
              {(loadingMeals || loadingWorkouts) && <div>Loading...</div>}
              {errorMeals && <div className="text-error">{errorMeals}</div>}
              {errorWorkouts && <div className="text-error">{errorWorkouts}</div>}
              {savedItems.length === 0 && !(loadingMeals || loadingWorkouts) && (
                <div className="text-base-content/50">No saved meal plans or workout plans found.</div>
              )}
              {savedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded bg-base-100 border-l-4 border-base-300">
                  <span>{item.name} <span className="text-xs text-base-content/40">({item.type})</span></span>
                  <button className="btn btn-sm btn-primary btn-circle" onClick={() => handleAddToPending(item)}>
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
