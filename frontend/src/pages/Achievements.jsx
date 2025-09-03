import React, { useEffect } from "react";
import { useAchievementsStore } from '../store/achievementsStore';

const Achievements = () => {
  const { achievements, isLoading, error, fetchAchievements } = useAchievementsStore();

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const earned = achievements.filter(a => a.earned);
  const locked = achievements.filter(a => !a.earned);

  return (
    <div className="p-3 sm:p-4 lg:p-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">Achievements</h1>
      {isLoading ? (
        <div className="flex justify-center">
          <div className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="alert alert-error text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-success">
              Earned Achievements ({earned.length})
            </h2>
            {earned.length === 0 ? (
              <p className="text-base-content/60 text-sm sm:text-base">No achievements earned yet.</p>
            ) : (
              <ul className="space-y-3 sm:space-y-4">
                {earned.map(a => (
                  <li key={a._id} className="p-3 sm:p-4 bg-success/10 rounded-lg border-l-4 border-success flex items-start gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl flex-shrink-0">{a.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-success text-sm sm:text-base break-words">{a.name}</div>
                      <div className="text-base-content/70 text-xs sm:text-sm break-words">{a.description}</div>
                      <div className="text-xs text-base-content/50 mt-1">Earned: {a.earnedAt ? new Date(a.earnedAt).toLocaleDateString() : '—'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-warning">
              Locked Achievements ({locked.length})
            </h2>
            {locked.length === 0 ? (
              <p className="text-base-content/60 text-sm sm:text-base">All achievements earned!</p>
            ) : (
              <ul className="space-y-3 sm:space-y-4">
                {locked.map(a => (
                  <li key={a._id} className="p-3 sm:p-4 bg-warning/10 rounded-lg border-l-4 border-warning flex items-start gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl flex-shrink-0">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-warning text-sm sm:text-base break-words">{a.name}</div>
                      <div className="text-base-content/70 text-xs sm:text-sm break-words">{a.description}</div>
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
    </div>
  );
};

export default Achievements;
