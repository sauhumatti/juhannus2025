"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import game components to prevent SSR issues
const DartGame = dynamic(() => import("@/components/games/DartGame"));
const PuttingGame = dynamic(() => import("@/components/games/PuttingGame"));
const BeerPongGame = dynamic(() => import("@/components/games/BeerPongGame"));
const BeerGame = dynamic(() => import("@/components/games/BeerGame"));

const tabs = [
  { id: "darts", name: "Tikanheitto" },
  { id: "putting", name: "Puttaus" },
  { id: "beerpong", name: "Beer Pong" },
  { id: "beer", name: "Kaljakellotus" },
];

export default function Games() {
  const [activeTab, setActiveTab] = useState("darts");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Pelit</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="mt-6">
            {activeTab === "darts" && <DartGame />}
            {activeTab === "putting" && <PuttingGame />}
            {activeTab === "beerpong" && <BeerPongGame />}
            {activeTab === "beer" && <BeerGame />}
          </div>
        </div>
      </div>
    </div>
  );
}