

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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-info mb-8">MEAL PLANNER</h1>
      <div className="flex flex-row gap-8 mb-6 items-start">
        <div className="flex-shrink-0">
          <button className="btn btn-info" onClick={() => {
            setShowModal(true);
            setPlanName("");
            setPlanItems([]);
            setCreatedAt(new Date());
          }}>
            Create A New Meal Plan
          </button>
        </div>
      </div>

      {/* Modal for creating meal plan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 btn btn-sm btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="text-2xl font-bold mb-4 text-info">Create Meal Plan</h2>
            <label className="block mb-2 font-semibold">Meal Plan Name</label>
            <input
              className="input input-bordered w-full mb-4"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              placeholder="Enter meal name..."
            />
            <div className="mb-4">
              <div className="flex gap-4 mb-2">
                <div className="font-semibold">Total Calories:</div>
                <div>{planItems.reduce((sum, item) => sum + (item.food?.calories || 0) * (item.quantity || 1), 0)} kcal</div>
              </div>
              <div className="flex gap-4 mb-2">
                <div className="font-semibold">Total Protein:</div>
                <div>{planItems.reduce((sum, item) => sum + (item.food?.protein || 0) * (item.quantity || 1), 0)} g</div>
              </div>
              <div className="flex gap-4 mb-2">
                <div className="font-semibold">Created At:</div>
                <div>{createdAt ? createdAt.toLocaleString() : "-"}</div>
              </div>
            </div>
            {/* Added items list */}
            <div className="mb-4">
              {planItems.length === 0 && <div className="text-base-content/60 mb-2">No items added yet.</div>}
              {planItems.map((item, idx) => (
                <div key={idx} className="card bg-base-200 mb-2 p-3 flex flex-row items-center justify-between">
                  <div>
                    <div className="font-semibold">{item.food.name}</div>
                    <div className="text-xs opacity-70">{item.quantity * 100}g &bull; {item.food.calories * item.quantity} kcal &bull; {item.food.protein * item.quantity}g protein</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-xs btn-outline" onClick={() => {
                      setPlanItems(planItems => planItems.map((it, i) => i === idx && it.quantity > 1 ? { ...it, quantity: it.quantity - 1 } : it));
                    }}>-</button>
                    <span className="font-mono">{item.quantity}</span>
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
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                  <button className="absolute top-2 right-2 btn btn-sm btn-ghost" onClick={() => setShowFoodPicker(false)}>✕</button>
                  <h3 className="text-xl font-bold mb-2 text-info">Add Food Item</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {CATEGORY_ORDER.map(cat => (
                      <button
                        key={cat}
                        className={`btn btn-xs ${pickerCategory === cat ? "btn-info text-info-content" : "btn-ghost"}`}
                        onClick={() => setPickerCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {foodsByCategory[pickerCategory]?.map(food => (
                      <div key={food._id} className="card bg-base-200 flex flex-row items-center justify-between p-3">
                        <div>
                          <div className="font-semibold">{food.name}</div>
                          <div className="text-xs opacity-70">Calories: <b>{food.calories}</b> kcal</div>
                          <div className="text-xs opacity-70">Protein: <b>{food.protein}</b>g</div>
                          <div className="text-xs opacity-70">Serving: 100g</div>
                        </div>
                        <button className="btn btn-info btn-xs" onClick={() => {
                          setPlanItems(planItems => [...planItems, { food, quantity: 1 }]);
                          setShowFoodPicker(false);
                        }}>+</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className={`btn btn-info${saving ? " loading" : ""}`}
                disabled={!planName || planItems.length === 0 || saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await api.post("/meal-plans", {
                      name: planName,
                      items: planItems.map(item => ({ food: item.food._id, quantity: item.quantity })),
                    });
                    setShowModal(false);
                    setPlanName("");
                    setPlanItems([]);
                    setCreatedAt(null);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Food Categories & Items (hidden in modal for now) */}
        <div className="md:col-span-2">
          <div className="card bg-base-200 mb-6 p-4">
            <h2 className="text-xl font-bold text-info mb-2">🍴 Food Categories</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {CATEGORY_ORDER.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${selectedCategory === cat ? "btn-info text-info-content" : "btn-ghost"}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="card bg-base-200 p-4">
            <h2 className="text-lg font-bold text-info mb-2 flex items-center gap-2">
              🍴 {selectedCategory}
              <span className="badge badge-info badge-sm">{foodsByCategory[selectedCategory]?.length || 0} items</span>
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">Loading...</div>
            ) : error ? (
              <div className="text-error">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foodsByCategory[selectedCategory]?.map(food => (
                  <div key={food._id} className="card bg-base-100 shadow flex flex-row items-center justify-between p-4">
                    <div>
                      <div className="font-semibold text-lg">{food.name}</div>
                      <div className="text-xs opacity-70">Calories: <b>{food.calories}</b> kcal</div>
                      <div className="text-xs opacity-70">Protein: <b>{food.protein}</b>g</div>
                      <div className="text-xs opacity-70">Serving: 100g</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Meal Plan Builder and Saved Plans */}
        <div className="md:col-span-1">
          <div className="card bg-base-200 p-4 mb-6">
            <h2 className="text-lg font-bold text-info mb-2">🍴 Current Meal Plan</h2>
            <div className="text-base-content/60">(UI coming soon)</div>
          </div>
          <div className="card bg-base-200 p-4">
            <h2 className="text-lg font-bold text-info mb-2">Saved Meal Plans</h2>
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
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-xs opacity-70">
                      {plan.items.length} items &bull; {plan.items.reduce((sum, it) => sum + (it.food?.calories || 0) * (it.quantity || 1), 0)} kcal &bull; {plan.items.reduce((sum, it) => sum + (it.food?.protein || 0) * (it.quantity || 1), 0)}g protein
                    </div>
                    <div className="text-xs opacity-60">Created: {new Date(plan.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
            {/* View/Edit/Delete/Copy Modal */}
            {viewPlan && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-base-100 rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                  <button className="absolute top-2 right-2 btn btn-sm btn-ghost" onClick={() => setViewPlan(null)}>✕</button>
                  <h2 className="text-2xl font-bold mb-4 text-info">{viewPlan.name}</h2>
                  <div className="mb-2 text-xs opacity-60">Created: {new Date(viewPlan.createdAt).toLocaleString()}</div>
                  <div className="mb-4">
                    <div className="font-semibold mb-2">Items:</div>
                    <ul className="space-y-2">
                      {viewPlan.items.map((item, idx) => (
                        <li key={idx} className="card bg-base-200 p-2 flex flex-row items-center justify-between">
                          <div>
                            <div className="font-semibold">{item.food?.name}</div>
                            <div className="text-xs opacity-70">{item.quantity * 100}g &bull; {item.food?.calories * item.quantity} kcal &bull; {item.food?.protein * item.quantity}g protein</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-4 flex gap-4">
                    <div>Total Calories: <b>{viewPlan.items.reduce((sum, it) => sum + (it.food?.calories || 0) * (it.quantity || 1), 0)}</b> kcal</div>
                    <div>Total Protein: <b>{viewPlan.items.reduce((sum, it) => sum + (it.food?.protein || 0) * (it.quantity || 1), 0)}</b> g</div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button className="btn btn-error" disabled={deleting} onClick={async () => {
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
                    <button className="btn btn-outline" onClick={() => {
                      // Edit: open modal with this plan's data
                      setShowModal(true);
                      setPlanName(viewPlan.name);
                      setPlanItems(viewPlan.items.map(it => ({ food: it.food, quantity: it.quantity })));
                      setCreatedAt(new Date(viewPlan.createdAt));
                      setViewPlan(null);
                    }}>Edit</button>
                    <button className="btn btn-info" onClick={() => {
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
