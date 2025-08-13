import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useFitnessStore } from "../store/fitnessStore";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

const WeeklySummary = () => {
  const { userInfo, getBMICategory, getCalorieBalance, getDailyProgress } = useFitnessStore();
  const { user } = useAuthStore();
  const bmiInfo = userInfo?.bmi ? getBMICategory(userInfo.bmi) : null;
  const calorieBalance = getCalorieBalance();
  const dailyProgress = getDailyProgress();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-base-100">
        <Navbar />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8 text-base-content">Here's your weekly summary!</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-[auto,auto] gap-4 md:gap-y-0 w-full">
            {/* Fitness Box */}
            <div className="card bg-base-200 shadow-xl rounded-lg relative md:row-start-1 md:col-start-1 flex-1">
              <div className="card-body pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">Fitness Summary:</h2>
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-ghost btn-circle">
                      <span className="text-2xl">&#8942;</span>
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2">
                      <li><Link to="/trends">Go to Fitness Page</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Days Worked Out (Bar Chart) */}
                  <div>
                    <div className="font-semibold mb-2">Days Worked Out:</div>
                    <div className="h-32">
                      {/* Bar Chart with Y-axis values for hours */}
                      <svg width="100%" height="100" viewBox="0 0 210 100">
                        {/* Y axis lines */}
                        <line x1="30" y1="20" x2="210" y2="20" stroke="#ccc" />
                        <line x1="30" y1="50" x2="210" y2="50" stroke="#ccc" />
                        <line x1="30" y1="80" x2="210" y2="80" stroke="#ccc" />
                        {/* Y axis labels */}
                        <text x="0" y="25" fontSize="12">5h</text>
                        <text x="0" y="55" fontSize="12">3h</text>
                        <text x="0" y="85" fontSize="12">1h</text>
                        {/* Bars for each day (S, M, T, W, T, F, S) */}
                        <rect x="40" y="50" width="20" height="30" fill="#22c55e" />
                        <rect x="70" y="70" width="20" height="10" fill="#22c55e" />
                        <rect x="100" y="50" width="20" height="30" fill="#22c55e" />
                        <rect x="130" y="20" width="20" height="60" fill="#22c55e" />
                        <rect x="160" y="20" width="20" height="60" fill="#22c55e" />
                        <rect x="190" y="50" width="20" height="30" fill="#22c55e" />
                        {/* Day labels */}
                        <text x="50" y="95" textAnchor="middle" fontSize="12">S</text>
                        <text x="80" y="95" textAnchor="middle" fontSize="12">M</text>
                        <text x="110" y="95" textAnchor="middle" fontSize="12">T</text>
                        <text x="140" y="95" textAnchor="middle" fontSize="12">W</text>
                        <text x="170" y="95" textAnchor="middle" fontSize="12">T</text>
                        <text x="200" y="95" textAnchor="middle" fontSize="12">F</text>
                      </svg>
                    </div>
                  </div>
                  {/* Calories (Line Chart) */}
                  <div>
                    <div className="font-semibold mb-2">Calories:</div>
                    <div className="h-32">
                      {/* Line Chart with Y-axis values for calories */}
                      <svg width="100%" height="100" viewBox="0 0 210 100">
                        {/* Y axis lines */}
                        <line x1="30" y1="20" x2="210" y2="20" stroke="#ccc" />
                        <line x1="30" y1="50" x2="210" y2="50" stroke="#ccc" />
                        <line x1="30" y1="80" x2="210" y2="80" stroke="#ccc" />
                        {/* Y axis labels */}
                        <text x="0" y="25" fontSize="12">2.2k</text>
                        <text x="0" y="55" fontSize="12">2k</text>
                        <text x="0" y="85" fontSize="12">1.8k</text>
                        {/* Line for calories */}
                        <polyline points="40,40 70,80 100,60 130,50 160,40 190,50 220,45" fill="none" stroke="#22c55e" strokeWidth="3" />
                        {/* Day labels */}
                        <text x="50" y="95" textAnchor="middle" fontSize="12">S</text>
                        <text x="80" y="95" textAnchor="middle" fontSize="12">M</text>
                        <text x="110" y="95" textAnchor="middle" fontSize="12">T</text>
                        <text x="140" y="95" textAnchor="middle" fontSize="12">W</text>
                        <text x="170" y="95" textAnchor="middle" fontSize="12">T</text>
                        <text x="200" y="95" textAnchor="middle" fontSize="12">F</text>
                        <text x="230" y="95" textAnchor="middle" fontSize="12">S</text>
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Exercises Done (Mini Bar Charts) */}
                <div className="mt-8">
                  <div className="font-semibold mb-2">Exercises Done:</div>
                  <div className="grid grid-cols-5 gap-4">
                    {['Chest', 'Biceps', 'Triceps', 'Shoulders', 'Legs'].map((muscle, idx) => (
                      <div key={muscle} className="flex flex-col items-center">
                        <svg width="80" height="60" viewBox="0 0 80 60">
                          {/* Y axis lines and labels */}
                          <line x1="20" y1="15" x2="75" y2="15" stroke="#ccc" />
                          <line x1="20" y1="35" x2="75" y2="35" stroke="#ccc" />
                          <line x1="20" y1="55" x2="75" y2="55" stroke="#ccc" />
                          <text x="2" y="20" fontSize="12">5</text>
                          <text x="2" y="40" fontSize="12">3</text>
                          <text x="2" y="58" fontSize="12">1</text>
                          {/* Bar for exercises done (example: 3 workouts) */}
                          <rect x="35" y="35" width="20" height="20" fill="#22c55e" />
                        </svg>
                        <span className="mt-1 text-xs">{muscle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Finances Box */}
            <div className="card bg-base-200 shadow-xl rounded-lg relative md:row-start-1 md:col-start-2 flex-1">
              <div className="card-body pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="card-title text-2xl">Finances</h2>
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-ghost btn-circle">
                      <span className="text-2xl">&#8942;</span>
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2">
                      <li><Link to="/expenses">Go to Finances Page</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold mb-2">Targets:</div>
                    <div className="mb-2">Saved:</div>
                    <div className="w-full h-4 bg-base-300 rounded-full mb-2">
                      <div className="h-4" style={{ width: '70%', backgroundColor: '#ffe066', borderRadius: '9999px' }}></div>
                    </div>
                    <div className="relative w-full flex mb-4" style={{ height: '1.5em' }}>
                      <span className="absolute left-0" style={{ minWidth: '60px' }}>0 BDT/-</span>
                      <span className="absolute left-1/2 transform -translate-x-1/2" style={{ minWidth: '60px' }}>1000 BDT/-</span>
                      <span className="absolute right-0 text-right" style={{ minWidth: '60px' }}>2000 BDT/-</span>
                    </div>
                    <div className="mb-2">Spent:</div>
                    <div className="w-full h-4 bg-base-300 rounded-full mb-2">
                      <div className="h-4" style={{ width: '50%', backgroundColor: '#ffe066', borderRadius: '9999px' }}></div>
                    </div>
                    <div className="relative w-full flex mb-4" style={{ height: '1.5em' }}>
                      <span className="absolute left-0" style={{ minWidth: '60px' }}>0 BDT/-</span>
                      <span className="absolute left-1/2 transform -translate-x-1/2" style={{ minWidth: '60px' }}>1000 BDT/-</span>
                      <span className="absolute right-0 text-right" style={{ minWidth: '60px' }}>2000 BDT/-</span>
                    </div>
                    <div className="font-semibold mb-2">Recent Transactions:</div>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg px-4 py-2 grid grid-cols-3 items-center" style={{ backgroundColor: '#ffe066', color: '#222' }}>
                        <span className="col-span-1">Hangout</span>
                        <span className="col-span-1 text-center">13/07/2025</span>
                        <span className="col-span-1 text-right">-425 BDT/-</span>
                      </div>
                      <div className="rounded-lg px-4 py-2 grid grid-cols-3 items-center" style={{ backgroundColor: '#ffe066', color: '#222' }}>
                        <span className="col-span-1">Family Dinner</span>
                        <span className="col-span-1 text-center">10/07/2025</span>
                        <span className="col-span-1 text-right">-850 BDT/-</span>
                      </div>
                      <div className="rounded-lg px-4 py-2 grid grid-cols-3 items-center" style={{ backgroundColor: '#ffe066', color: '#222' }}>
                        <span className="col-span-1">Shopping</span>
                        <span className="col-span-1 text-center">08/07/2025</span>
                        <span className="col-span-1 text-right">-350 BDT/-</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="font-semibold mb-2">Daily Breakdown:</div>
                      <svg width="100%" height="120" viewBox="0 0 300 120">
                        <line x1="40" y1="20" x2="280" y2="20" stroke="#ccc" />
                        <line x1="40" y1="50" x2="280" y2="50" stroke="#ccc" />
                        <line x1="40" y1="80" x2="280" y2="80" stroke="#ccc" />
                        {/* Y axis labels */}
                        <text x="10" y="25" fontSize="12">2.2k</text>
                        <text x="10" y="55" fontSize="12">2k</text>
                        <text x="10" y="85" fontSize="12">1.8k</text>
                        {/* Line chart points */}
                        <polyline points="40,100 70,80 100,90 130,90 160,70 190,50 220,60 250,55 280,70" fill="none" stroke="#38bdf8" strokeWidth="3" />
                        {/* Dots */}
                        <circle cx="40" cy="100" r="4" fill="#38bdf8" />
                        <circle cx="70" cy="80" r="4" fill="#38bdf8" />
                        <circle cx="100" cy="90" r="4" fill="#38bdf8" />
                        <circle cx="130" cy="90" r="4" fill="#38bdf8" />
                        <circle cx="160" cy="70" r="4" fill="#38bdf8" />
                        <circle cx="190" cy="50" r="4" fill="#38bdf8" />
                        <circle cx="220" cy="60" r="4" fill="#38bdf8" />
                        <circle cx="250" cy="55" r="4" fill="#38bdf8" />
                        <circle cx="280" cy="70" r="4" fill="#38bdf8" />
                        {/* Day labels */}
                        <text x="40" y="115" textAnchor="middle" fontSize="12">S</text>
                        <text x="100" y="115" textAnchor="middle" fontSize="12">T</text>
                        <text x="130" y="115" textAnchor="middle" fontSize="12">W</text>
                      </svg>
                    </div>
                    <div className="mt-8">
                      <div className="font-semibold mb-2">Budget:</div>
                      <div className="bg-base-300 rounded-lg shadow px-6 py-4 text-center text-3xl font-bold">
                        1625 <span className="text-base font-normal">/ 2500 BDT/-</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card bg-base-200 shadow-xl min-h-[200px] relative md:col-span-2 md:row-start-2 mt-6">
              <div className="card-body pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="card-title text-2xl">Goals</h2>
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-ghost btn-circle">
                      <span className="text-2xl">&#8942;</span>
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2">
                      <li><Link to="/goals">Go to Goals Page</Link></li>
                    </ul>
                  </div>
                </div>
                {/* Redesigned Goals Box - Placeholder data, backend ready */}
                <div className="font-semibold mb-2">Tasks Completed:</div>
                <div className="mb-2">This Week:</div>
                <div className="flex items-center mb-2">
                  {(() => {
                    const completed = 5;
                    const total = 19;
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return (
                      <div className="flex items-center w-full">
                        <div className="relative" style={{ width: '60%' }}>
                          <div className="w-full h-3 bg-base-300 rounded-full">
                            <div className="h-3" style={{ width: `${percent}%`, backgroundColor: '#60a5fa', borderRadius: '9999px' }}></div>
                          </div>
                          <div className="absolute left-0 top-5 text-xs">0%</div>
                          <div className="absolute left-1/2 top-5 transform -translate-x-1/2 text-xs">50%</div>
                          <div className="absolute right-0 top-5 text-xs">100%</div>
                        </div>
                        <span className="ml-4 text-base font-semibold">{completed} / {total} tasks</span>
                      </div>
                    );
                  })()}
                </div>
                {/* Dot Graph for daily tasks - fixed alignment and y-axis bar */}
                <div className="mt-0 mb-0 flex justify-center">
                  <svg width="600" height="200" viewBox="0 0 520 200">
                    {/* Y axis bar */}
                    <line x1="60" y1="30" x2="60" y2="170" stroke="#222" strokeWidth="2" />
                    {/* X axis */}
                    <line x1="60" y1="170" x2="500" y2="170" stroke="#222" />
                    {/* Dots for each day (example data) - smaller radius, more vertical space */}
                    {/* S */}
                    <circle cx="100" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="100" cy="90" r="7" fill="#bbb" />
                    <circle cx="100" cy="120" r="7" fill="#bbb" />
                    {/* M */}
                    <circle cx="160" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="160" cy="90" r="7" fill="#bbb" />
                    <circle cx="160" cy="120" r="7" fill="#bbb" />
                    <circle cx="160" cy="150" r="7" fill="#bbb" />
                    {/* T */}
                    <circle cx="220" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="220" cy="90" r="7" fill="#bbb" />
                    <circle cx="220" cy="120" r="7" fill="#bbb" />
                    <circle cx="220" cy="150" r="7" fill="#bbb" />
                    {/* W */}
                    <circle cx="280" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="280" cy="90" r="7" fill="#bbb" />
                    <circle cx="280" cy="120" r="7" fill="#bbb" />
                    <circle cx="280" cy="150" r="7" fill="#bbb" />
                    {/* T */}
                    <circle cx="340" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="340" cy="90" r="7" fill="#bbb" />
                    <circle cx="340" cy="120" r="7" fill="#bbb" />
                    {/* F */}
                    <circle cx="400" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="400" cy="90" r="7" fill="#bbb" />
                    <circle cx="400" cy="120" r="7" fill="#bbb" />
                    <circle cx="400" cy="150" r="7" fill="#bbb" />
                    {/* S */}
                    <circle cx="460" cy="60" r="7" fill="#60a5fa" />
                    <circle cx="460" cy="90" r="7" fill="#bbb" />
                    <circle cx="460" cy="120" r="7" fill="#bbb" />
                    <circle cx="460" cy="150" r="7" fill="#bbb" />
                    {/* Day labels - spaced under dots */}
                    <text x="100" y="190" textAnchor="middle" fontSize="16">S</text>
                    <text x="160" y="190" textAnchor="middle" fontSize="16">M</text>
                    <text x="220" y="190" textAnchor="middle" fontSize="16">T</text>
                    <text x="280" y="190" textAnchor="middle" fontSize="16">W</text>
                    <text x="340" y="190" textAnchor="middle" fontSize="16">T</text>
                    <text x="400" y="190" textAnchor="middle" fontSize="16">F</text>
                    <text x="460" y="190" textAnchor="middle" fontSize="16">S</text>
                  </svg>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* On-going Tasks */}
                  <div>
                    <div className="font-semibold mb-2">On-going Tasks:</div>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                        <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>Learn Adobe Premier Pro</span>
                        <span>3/7 Days</span>
                      </div>
                      <div className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                        <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>Finish CSE471 Slide #2</span>
                        <span>5/7 Days</span>
                      </div>
                    </div>
                  </div>
                  {/* Completed Tasks */}
                  <div>
                    <div className="font-semibold mb-2">Completed Tasks:</div>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                        <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>Finish CSE321 Slide #4</span>
                        <span className="ml-2"><span className="inline-block w-6 h-6 rounded-full bg-success text-white flex items-center justify-center">&#10003;</span></span>
                      </div>
                      <div className="rounded-lg px-2 py-1 flex justify-between items-center" style={{ backgroundColor: '#e0f2fe', color: '#222', fontSize: '1em', width: '80%' }}>
                        <span className="flex items-center"><span className="mr-2" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>Watch "Uthshob" with friends</span>
                        <span className="ml-2"><span className="inline-block w-6 h-6 rounded-full bg-success text-white flex items-center justify-center">&#10003;</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WeeklySummary;
