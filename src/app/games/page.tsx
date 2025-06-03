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
  { id: "beer", name: "Kaljakellotus" },
  { id: "icebreaker", name: "Tutustumispeli" },
  { id: "beerpong", name: "Beer Pong" },
];

export default function Games() {
  const [activeTab, setActiveTab] = useState("darts");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8 border-2 border-blue-200">
          <h1 className="text-5xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-dancing)' }}>Pelit</h1>
          <div className="w-32 h-1 bg-blue-400 mx-auto mb-6"></div>

          {/* Tabs */}
          <div className="relative">
            <div className="border-b border-gray-200 -mx-6 px-6 overflow-x-auto scrollbar-hide">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
                {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
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
        </div>

          {/* Content */}
          <div className="mt-6">
            {activeTab === "darts" && <DartGame />}
            {activeTab === "putting" && <PuttingGame />}
            {activeTab === "beerpong" && <BeerPongGame />}
            {activeTab === "beer" && <BeerGame />}
            {activeTab === "icebreaker" && (
              <div className="text-center py-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  🎯 Tutustumispeli
                </h2>
                <p className="text-gray-600 mb-6">
                  Opi tuntemaan muut juhlijat hauskan pelin avulla!
                </p>
                <a
                  href="/icebreaker"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Siirry Tutustumispeliin
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}