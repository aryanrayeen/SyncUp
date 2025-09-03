

import React, { useEffect, useState } from "react";
import api from "../lib/axios";

const CATEGORY_ORDER = ["Carbs", "Proteins", "Fruits", "Vegetables", "Dairy", "Snacks"];


const MealPlan = () => {
  // Saved plans state and fetch logic
  const [saving, setSaving] = useState(false);
  const [viewPlan, setViewPlan] = useState(null); // plan object to view
  const [deleting, setDeleting] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errorPlans, setErrorPlans] = useState(null);
  const fetchSavedPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get("/meal-plans");
      setSavedPlans(res.data);
      setErrorPlans(null);
    } catch (err) {
      setErrorPlans("Failed to load saved meal plans");
    } finally {
      setLoadingPlans(false);
    }
  };
  useEffect(() => { fetchSavedPlans(); }, []);

  const [foodItems, setFoodItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Carbs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Meal plan creation state
  const [showModal, setShowModal] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planItems, setPlanItems] = useState([]); // {food, quantity}
  const [createdAt, setCreatedAt] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null); // Track if editing
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState("Carbs");

  useEffect(() => {
    async function fetchFoods() {
      setLoading(true);
      try {
        const res = await api.get("/meal-plans/foods");
        setFoodItems(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load food items");
      } finally {
        setLoading(false);
      }
    }
    fetchFoods();
  }, []);

  // Group food items by category
  const foodsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = foodItems.filter(f => f.category === cat);
    return acc;
  }, {});

  return (
    <div className="p-3 sm:p-4 lg:p-8 max-w-full lg:max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-info mb-4 sm:mb-6 lg:mb-8">MEAL PLANNER</h1>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-4 sm:mb-6 items-start">
        <div className="w-full sm:flex-shrink-0">
          <button className="btn btn-info w-full sm:w-auto" onClick={() => {
            setShowModal(true);
            setPlanName("");
            setPlanItems([]);
            setCreatedAt(new Date());
            setEditingPlanId(null);
          }}>
            Create A New Meal Plan
          </button>
        </div>
      </div>

      {/* Modal for creating meal plan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 btn btn-sm btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-info">Create Meal Plan</h2>
            <label className="block mb-2 font-semibold">Meal Plan Name</label>
            <input
              className="input input-bordered w-full mb-4"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              placeholder="Enter meal name..."
            />
            <div className="mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                <div className="flex justify-between">
                  <div className="font-semibold">Total Calories:</div>
                  <div>{planItems.reduce((sum, item) => sum + (item.food?.calories || 0) * (item.quantity || 1), 0)} kcal</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Total Protein:</div>
                  <div>{planItems.reduce((sum, item) => sum + (item.food?.protein || 0) * (item.quantity || 1), 0)} g</div>
                </div>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <div className="font-semibold">Created At:</div>
                <div className="text-xs sm:text-sm">{createdAt ? createdAt.toLocaleString() : "-"}</div>
              </div>
            </div>
            {/* Added items list */}
            <div className="mb-4">
              {planItems.length === 0 && <div className="text-base-content/60 mb-2">No items added yet.</div>}
              {planItems.map((item, idx) => (
                <div key={idx} className="card bg-base-200 mb-2 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold break-words">{item.food.name}</div>
                    <div className="text-xs opacity-70 break-words">{item.quantity * 100}g • {item.food.calories * item.quantity} kcal • {item.food.protein * item.quantity}g protein</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="btn btn-xs btn-outline" onClick={() => {
                      setPlanItems(planItems => planItems.map((it, i) => i === idx && it.quantity > 1 ? { ...it, quantity: it.quantity - 1 } : it));
                    }}>-</button>
                    <span className="font-mono text-sm">{item.quantity}</span>
                    <button className="btn btn-xs btn-outline" onClick={() => {
                      setPlanItems(planItems => planItems.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it));
                    }}>+</button>
                    <button className="btn btn-xs btn-error" onClick={() => {
                      setPlanItems(planItems => planItems.filter((_, i) => i !== idx));
                    }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            {/* Add item button */}
            <div className="flex mb-4">
              <button className="btn btn-info btn-sm w-full" onClick={() => {
                setShowFoodPicker(true);
                setPickerCategory("Carbs");
              }}>+ Add Item</button>
            </div>
            {/* Food picker modal */}
            {showFoodPicker && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                  <button className="absolute top-2 right-2 btn btn-sm btn-ghost" onClick={() => setShowFoodPicker(false)}>✕</button>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-info">Add Food Item</h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                    {CATEGORY_ORDER.map(cat => (
                      <button
                        key={cat}
                        className={`btn btn-xs sm:btn-sm ${pickerCategory === cat ? "btn-info text-info-content" : "btn-ghost"}`}
                        onClick={() => setPickerCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {foodsByCategory[pickerCategory]?.map(food => (
                      <div key={food._id} className="card bg-base-200 flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold break-words">{food.name}</div>
                          <div className="text-xs opacity-70">Calories: <b>{food.calories}</b> kcal • Protein: <b>{food.protein}</b>g • Serving: 100g</div>
                        </div>
                        <button className="btn btn-info btn-xs flex-shrink-0" onClick={() => {
                          setPlanItems(planItems => [...planItems, { food, quantity: 1 }]);
                          setShowFoodPicker(false);
                        }}>+</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button className="btn btn-ghost order-2 sm:order-1" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className={`btn btn-info order-1 sm:order-2${saving ? " loading" : ""}`}
                disabled={!planName || planItems.length === 0 || saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    if (editingPlanId) {
                      await api.put(`/meal-plans/${editingPlanId}`,
                        {
                          name: planName,
                          items: planItems.map(item => ({ food: item.food._id, quantity: item.quantity })),
                        }
                      );
                    } else {
                      await api.post("/meal-plans", {
                        name: planName,
                        items: planItems.map(item => ({ food: item.food._id, quantity: item.quantity })),
                      });
                    }
                    setShowModal(false);
                    setPlanName("");
                    setPlanItems([]);
                    setCreatedAt(null);
                    setEditingPlanId(null);
                    await fetchSavedPlans();
                  } catch (err) {
                    alert("Failed to save meal plan");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Food Categories & Items */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="card bg-base-200 mb-4 sm:mb-6 p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-bold text-info mb-2">🍴 Food Categories</h2>
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
              {CATEGORY_ORDER.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-xs sm:btn-sm ${selectedCategory === cat ? "btn-info text-info-content" : "btn-ghost"}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="card bg-base-200 p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-bold text-info mb-2 flex items-center gap-2 flex-wrap">
              🍴 {selectedCategory}
              <span className="badge badge-info badge-sm">{foodsByCategory[selectedCategory]?.length || 0} items</span>
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">Loading...</div>
            ) : error ? (
              <div className="text-error">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {foodsByCategory[selectedCategory]?.map(food => (
                  <div key={food._id} className="card bg-base-100 shadow flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-lg break-words">{food.name}</div>
                      <div className="text-xs opacity-70">Calories: <b>{food.calories}</b> kcal • Protein: <b>{food.protein}</b>g • Serving: 100g</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Meal Plan Builder and Saved Plans */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="card bg-base-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-info mb-2">🍴 Current Meal Plan</h2>
            <div className="text-base-content/60">(UI coming soon)</div>
          </div>
          <div className="card bg-base-200 p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-bold text-info mb-2">Saved Meal Plans</h2>
            {loadingPlans ? (
              <div className="text-base-content/60">Loading...</div>
            ) : errorPlans ? (
              <div className="text-error">{errorPlans}</div>
            ) : savedPlans.length === 0 ? (
              <div className="text-base-content/60">No meal plans saved yet.</div>
            ) : (
              <ul className="space-y-2">
                {savedPlans.map(plan => (
                  <li key={plan._id} className="card bg-base-100 p-3 flex flex-col gap-1 cursor-pointer hover:bg-base-200 transition" onClick={() => setViewPlan(plan)}>
                    <div className="font-semibold text-sm break-words">{plan.name}</div>
                    <div className="text-xs opacity-70">
                      {plan.items.length} items • {plan.items.reduce((sum, it) => sum + (it.food?.calories || 0) * (it.quantity || 1), 0)} kcal • {plan.items.reduce((sum, it) => sum + (it.food?.protein || 0) * (it.quantity || 1), 0)}g protein
                    </div>
                    <div className="text-xs opacity-60">Created: {new Date(plan.createdAt).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            )}
            {/* View/Edit/Delete/Copy Modal */}
            {viewPlan && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                  <button className="absolute top-2 right-2 btn btn-sm btn-ghost" onClick={() => setViewPlan(null)}>✕</button>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 text-info break-words">{viewPlan.name}</h2>
                  <div className="mb-2 text-xs opacity-60">Created: {new Date(viewPlan.createdAt).toLocaleDateString()}</div>
                  <div className="mb-4">
                    <div className="font-semibold mb-2">Items:</div>
                    <ul className="space-y-2">
                      {viewPlan.items.map((item, idx) => (
                        <li key={idx} className="card bg-base-200 p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold break-words">{item.food?.name}</div>
                            <div className="text-xs opacity-70">{item.quantity * 100}g • {item.food?.calories * item.quantity} kcal • {item.food?.protein * item.quantity}g protein</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Calories:</span>
                      <span className="font-bold">{viewPlan.items.reduce((sum, it) => sum + (it.food?.calories || 0) * (it.quantity || 1), 0)} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Protein:</span>
                      <span className="font-bold">{viewPlan.items.reduce((sum, it) => sum + (it.food?.protein || 0) * (it.quantity || 1), 0)} g</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                    <button className="btn btn-error order-3 sm:order-1" disabled={deleting} onClick={async () => {
                      if (!window.confirm("Delete this meal plan?")) return;
                      setDeleting(true);
                      try {
                        await api.delete(`/meal-plans/${viewPlan._id}`);
                        setViewPlan(null);
                        await fetchSavedPlans();
                      } catch (err) {
                        alert("Failed to delete meal plan");
                      } finally {
                        setDeleting(false);
                      }
                    }}>Delete</button>
                    <button className="btn btn-outline order-2" onClick={() => {
                      // Edit: open modal with this plan's data
                      setShowModal(true);
                      setPlanName(viewPlan.name);
                      setPlanItems(viewPlan.items.map(it => ({ food: it.food, quantity: it.quantity })));
                      setCreatedAt(new Date(viewPlan.createdAt));
                      setEditingPlanId(viewPlan._id);
                      setViewPlan(null);
                    }}>Edit</button>
                    <button className="btn btn-info order-1 sm:order-3" onClick={() => {
                      // Copy: open modal with this plan's data but clear _id and set new date
                      setShowModal(true);
                      setPlanName(viewPlan.name + " (Copy)");
                      setPlanItems(viewPlan.items.map(it => ({ food: it.food, quantity: it.quantity })));
                      setCreatedAt(new Date());
                      setViewPlan(null);
                    }}>Save as New</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
