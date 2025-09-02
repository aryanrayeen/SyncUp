import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAchievementsStore } from '../store/achievementsStore';

const Achievements = () => {
  const { achievements, isLoading, error, fetchAchievements } = useAchievementsStore();

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const earned = achievements.filter(a => a.earned);
  const locked = achievements.filter(a => !a.earned);

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Achievements</h1>
          {isLoading ? (
            <div className="loading loading-spinner loading-lg text-primary mx-auto" />
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-success">
                  Earned Achievements ({earned.length})
                </h2>
                {earned.length === 0 ? (
                  <p className="text-base-content/60">No achievements earned yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {earned.map(a => (
                      <li key={a._id} className="p-4 bg-success/10 rounded-lg border-l-4 border-success flex items-center gap-4">
                        <span className="text-3xl">{a.icon}</span>
                        <div>
                          <div className="font-bold text-success">{a.name}</div>
                          <div className="text-base-content/70 text-sm">{a.description}</div>
                          <div className="text-xs text-base-content/50 mt-1">Earned: {a.earnedAt ? new Date(a.earnedAt).toLocaleDateString() : '—'}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4 text-warning">
                  Locked Achievements ({locked.length})
                </h2>
                {locked.length === 0 ? (
                  <p className="text-base-content/60">All achievements earned!</p>
                ) : (
                  <ul className="space-y-4">
                    {locked.map(a => (
                      <li key={a._id} className="p-4 bg-warning/10 rounded-lg border-l-4 border-warning flex items-center gap-4">
                        <span className="text-3xl">{a.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-warning">{a.name}</div>
                          <div className="text-base-content/70 text-sm">{a.description}</div>
                          <div className="mt-2">
                            <div className="w-full bg-base-300 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-warning"
                                style={{ width: `${Math.min((a.progress / (a.requirement.streak || a.requirement.months || a.requirement.amount)) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-base-content/50 mt-1">
                              Progress: {a.progress} / {a.requirement.streak || a.requirement.months || a.requirement.amount}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Achievements;
