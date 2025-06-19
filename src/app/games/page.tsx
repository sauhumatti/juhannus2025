"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

// Dynamically import game components to prevent SSR issues
const DartGame = dynamic(() => import("@/components/games/DartGame"));
const PuttingGame = dynamic(() => import("@/components/games/PuttingGame"));
const BeerPongGame = dynamic(() => import("@/components/games/BeerPongGame"));
const GrillMaster = dynamic(() => import("@/components/games/GrillMaster"));
const MosquitoClicker = dynamic(() => import("@/components/games/MosquitoClicker"));
const MemoryGame = dynamic(() => import("@/components/games/MemoryGame"));

const games = [
  { 
    id: "darts", 
    name: "Tikanheitto", 
    icon: "🎯", 
    description: "Testaa tarkkuuttasi tikanheiton parissa",
    color: "from-green-400 to-green-600"
  },
  { 
    id: "putting", 
    name: "Puttaus", 
    icon: "⛳", 
    description: "Golf-puttausta kesämökillä",
    color: "from-blue-400 to-blue-600"
  },
  { 
    id: "beerpong", 
    name: "Beer Pong", 
    icon: "🍺", 
    description: "Klassinen juhlintapeli",
    color: "from-orange-400 to-orange-600"
  },
  { 
    id: "grill", 
    name: "Grillimestari", 
    icon: "🔥", 
    description: "Grillaa makkarat täydellisiksi",
    color: "from-red-400 to-red-600"
  },
  { 
    id: "mosquito", 
    name: "Hyttysjahtaaja", 
    icon: "🦟", 
    description: "Läiskäise kesän kiusanhenget",
    color: "from-purple-400 to-purple-600"
  },
  { 
    id: "molkky", 
    name: "Mölkky", 
    icon: "🎲", 
    description: "Perinteinen suomalainen heittopeli",
    color: "from-yellow-400 to-yellow-600"
  },
  { 
    id: "memory", 
    name: "Muistipeli", 
    icon: "🃏", 
    description: "Juhannus-teemainen muistipeli",
    color: "from-indigo-400 to-indigo-600"
  },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#F0FFF0' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/juhannus2025.png"
          alt="Juhannus 2025 Forest Background"
          fill
          className="object-cover opacity-30"
          quality={100}
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-4 pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              background: 'linear-gradient(135deg, #228B22, #32CD32)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            🎯 Juhannus Pelit
          </h1>
          <p 
            className="text-xl md:text-2xl mb-2"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              color: '#DAA520'
            }}
          >
            Valitse peli ja haasta kaverit! 🌲
          </p>
        </div>

        {activeGame ? (
          <div className="mb-6">
            <button
              onClick={() => setActiveGame(null)}
              className="mb-4 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-lg border border-green-200 hover:bg-green-50 transition-colors flex items-center gap-2"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#228B22'
              }}
            >
              ← Takaisin pelivalikkoon
            </button>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
              {activeGame === "darts" && <DartGame />}
              {activeGame === "putting" && <PuttingGame />}
              {activeGame === "beerpong" && <BeerPongGame />}
              {activeGame === "grill" && <GrillMaster />}
              {activeGame === "mosquito" && <MosquitoClicker />}
              {activeGame === "memory" && <MemoryGame />}
              {activeGame === "molkky" && (
                <div className="text-center py-8">
                  <h2 
                    className="text-3xl font-bold mb-4"
                    style={{ 
                      fontFamily: 'Fredoka One, cursive',
                      color: '#228B22'
                    }}
                  >
                    🎯 Mölkky
                  </h2>
                  <p 
                    className="text-lg mb-6"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    Perinteinen suomalainen heittopeli - ensimmäinen tasan 50 pisteeseen voittaa!
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                    <h3 
                      className="font-bold text-lg mb-3"
                      style={{ 
                        fontFamily: 'Fredoka One, cursive',
                        color: '#228B22'
                      }}
                    >
                      🌿 Mölkky Säännöt:
                    </h3>
                    <div 
                      className="text-left space-y-2"
                      style={{ 
                        fontFamily: 'Nunito, sans-serif',
                        color: '#2F4F4F'
                      }}
                    >
                      <p>• 1 keila kaatuu = keilassa oleva numero</p>
                      <p>• 2+ keilaa kaatuu = kaatuneiden keilojen määrä</p>
                      <p>• Yli 50 pistettä = palaa takaisin 25 pisteeseen</p>
                      <p>• 3 ohiheittoa peräkkäin = eliminoituminen</p>
                    </div>
                  </div>
                  <Link
                    href="/molkky"
                    className="inline-block px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-bold"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    🎯 Aloita Mölkky Peli
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all">
                  <div className={`bg-gradient-to-br ${game.color} rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                    {game.icon}
                  </div>
                  
                  <h3 
                    className="text-xl font-bold text-center mb-2"
                    style={{ 
                      fontFamily: 'Fredoka One, cursive',
                      color: '#228B22'
                    }}
                  >
                    {game.name}
                  </h3>
                  
                  <p 
                    className="text-center text-sm opacity-75 mb-4"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    {game.description}
                  </p>
                  
                  <div className="text-center">
                    <span 
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold group-hover:bg-green-700 transition-colors"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      Pelaa →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}