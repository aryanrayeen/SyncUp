import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Achievements = () => {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <h1 className="text-3xl font-bold">Achievements Page (Coming Soon)</h1>
        </main>
      </div>
    </div>
  );
};

export default Achievements;
