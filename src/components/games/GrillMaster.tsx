'use client';

import React, { useState, useEffect, useRef } from 'react';

type SausageState = 'raw' | 'cooking' | 'cooked' | 'burnt';

interface Sausage {
  id: string;
  x: number;
  y: number;
  state: SausageState;
  cookingTime: number;
  onGrill: boolean;
}

const COOK_TIME_PERFECT = 5000; // 5 seconds for perfect
const COOK_TIME_BURNT = 8000; // 8 seconds until burnt
const SAUSAGE_WIDTH = 150;
const SAUSAGE_HEIGHT = 60;
const GRILL_WIDTH = 800;
const GRILL_HEIGHT = 600;

export default function GrillMaster() {
  const [sausages, setSausages] = useState<Sausage[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [draggedSausage, setDraggedSausage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60); // 60 second game
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const grillRef = useRef<HTMLDivElement>(null);
  const rawPlateRef = useRef<HTMLDivElement>(null);
  const cookedPlateRef = useRef<HTMLDivElement>(null);

  // Initialize sausages
  useEffect(() => {
    if (gameActive) {
      const initialSausages: Sausage[] = [];
      // Place sausages on the raw plate
      for (let i = 0; i < 6; i++) {
        initialSausages.push({
          id: `sausage-${i}`,
          x: 80 + (i % 3) * 80,
          y: 720 + Math.floor(i / 3) * 60,
          state: 'raw',
          cookingTime: 0,
          onGrill: false
        });
      }
      setSausages(initialSausages);
    }
  }, [gameActive]);

  // Game timer
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameActive, timeLeft]);

  // Cooking logic
  useEffect(() => {
    if (!gameActive) return;

    const cookingInterval = setInterval(() => {
      setSausages(prev => prev.map(sausage => {
        if (!sausage.onGrill || sausage.state === 'burnt') return sausage;

        const newCookingTime = sausage.cookingTime + 100;
        let newState = sausage.state;

        if (newCookingTime >= COOK_TIME_BURNT) {
          newState = 'burnt';
        } else if (newCookingTime >= COOK_TIME_PERFECT) {
          newState = 'cooked';
        } else if (sausage.state === 'raw') {
          newState = 'cooking';
        }

        return { ...sausage, cookingTime: newCookingTime, state: newState };
      }));
    }, 100);

    return () => clearInterval(cookingInterval);
  }, [gameActive]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
  };

  const endGame = async () => {
    // Prevent multiple calls
    if (!gameActive) return;
    
    setGameActive(false);
    
    // Save score
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.id) {
      try {
        await fetch('/api/games/grill', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': user.id
          },
          body: JSON.stringify({ score })
        });
      } catch (error) {
        console.error('Failed to save score:', error);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, sausageId: string) => {
    setDraggedSausage(sausageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedSausage || !grillRef.current || !gameAreaRef.current) return;

    const grillRect = grillRef.current.getBoundingClientRect();
    const gameRect = gameAreaRef.current.getBoundingClientRect();
    const cookedPlateRect = cookedPlateRef.current?.getBoundingClientRect();
    
    const x = e.clientX - gameRect.left - SAUSAGE_WIDTH / 2;
    const y = e.clientY - gameRect.top - SAUSAGE_HEIGHT / 2;

    const grillX = grillRect.left - gameRect.left;
    const grillY = grillRect.top - gameRect.top;

    const onGrill = x > grillX - 50 && 
                    x < grillX + GRILL_WIDTH - SAUSAGE_WIDTH + 50 && 
                    y > grillY - 30 && 
                    y < grillY + GRILL_HEIGHT - SAUSAGE_HEIGHT + 30;

    // Check if dropped on cooked plate
    let onCookedPlate = false;
    if (cookedPlateRect) {
      const cookedX = cookedPlateRect.left - gameRect.left;
      const cookedY = cookedPlateRect.top - gameRect.top;
      onCookedPlate = x > cookedX - 50 && 
                      x < cookedX + 250 && 
                      y > cookedY - 50 && 
                      y < cookedY + 150;
    }

    setSausages(prev => prev.map(sausage => {
      if (sausage.id === draggedSausage) {
        // If moving to cooked plate and it's perfectly cooked, add score
        if (sausage.onGrill && onCookedPlate && sausage.state === 'cooked') {
          setScore(s => s + 10);
        }
        
        // Reset if not on grill or cooked plate
        const _shouldReset = !onGrill && !onCookedPlate;
        
        return { 
          ...sausage, 
          x, 
          y, 
          onGrill,
          cookingTime: onGrill ? sausage.cookingTime : 0,
          state: (onGrill || onCookedPlate) ? sausage.state : 'raw'
        };
      }
      return sausage;
    }));

    setDraggedSausage(null);
  };

  const getSausageImage = (state: SausageState) => {
    switch (state) {
      case 'raw': return '/grill-master-sausage-raw.png';
      case 'cooking': return '/grill-master-sausage-raw.png';
      case 'cooked': return '/grill-master-sausage-cooked.png';
      case 'burnt': return '/grill-master-sausage-burnt.png';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-green-50 border-4 border-green-800 rounded-lg p-6">
        <h2 className="text-3xl font-fredoka text-green-800 text-center mb-4">
          Grillimestari
        </h2>

        {!gameActive ? (
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              Vedä makkarat grilliin ja poista ne kun ovat valmiita!
            </p>
            <button
              onClick={startGame}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Aloita peli
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold text-green-800">
                Pisteet: {score}
              </div>
              <div className="text-2xl font-bold text-red-600">
                Aika: {timeLeft}s
              </div>
            </div>

            <div 
              ref={gameAreaRef}
              className="relative bg-green-100 rounded-lg p-8 h-[900px] overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Grill */}
              <div 
                ref={grillRef}
                className="absolute"
                style={{
                  left: '50%',
                  top: '40%',
                  transform: 'translate(-50%, -50%)',
                  width: GRILL_WIDTH,
                  height: GRILL_HEIGHT
                }}
              >
                <img 
                  src="/grill-master-grill.png" 
                  alt="Grill" 
                  className="w-full h-full"
                  draggable={false}
                />
              </div>

              {/* Raw Sausages Plate */}
              <div 
                ref={rawPlateRef}
                className="absolute"
                style={{
                  left: 50,
                  bottom: 100,
                  width: 300,
                  height: 200
                }}
              >
                <img 
                  src="/grill-master-plate.png" 
                  alt="Raw plate" 
                  className="w-full h-full"
                  draggable={false}
                />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 bg-white/90 px-3 py-1 rounded-lg">
                  <span className="text-sm font-bold text-gray-700">Raa&apos;at makkarat</span>
                </div>
              </div>

              {/* Cooked Sausages Plate */}
              <div 
                ref={cookedPlateRef}
                className="absolute"
                style={{
                  right: 50,
                  bottom: 100,
                  width: 300,
                  height: 200
                }}
              >
                <img 
                  src="/grill-master-plate.png" 
                  alt="Cooked plate" 
                  className="w-full h-full"
                  draggable={false}
                />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 bg-white/90 px-3 py-1 rounded-lg">
                  <span className="text-sm font-bold text-gray-700">Valmiit makkarat</span>
                </div>
              </div>

              {/* Sausages */}
              {sausages.map(sausage => (
                <div
                  key={sausage.id}
                  className={`absolute cursor-move transition-transform ${
                    sausage.state === 'cooking' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    left: sausage.x,
                    top: sausage.y,
                    width: SAUSAGE_WIDTH,
                    height: SAUSAGE_HEIGHT
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sausage.id)}
                >
                  <img 
                    src={getSausageImage(sausage.state)} 
                    alt="Makkara" 
                    className="w-full h-full"
                    draggable={false}
                  />
                  {sausage.onGrill && sausage.state === 'cooking' && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-500 rounded-full w-16 h-2">
                        <div 
                          className="bg-green-500 rounded-full h-full transition-all"
                          style={{
                            width: `${Math.min(100, (sausage.cookingTime / COOK_TIME_PERFECT) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Instructions */}
              <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-lg shadow-md">
                <p className="text-sm text-gray-700 font-medium">
                  📋 Ohjeet:<br/>
                  1. Vedä makkarat grilliin<br/>
                  2. Odota kunnes kultainen<br/>
                  3. Siirrä valmiit lautaselle<br/>
                  <span className="text-green-600">🟢 Valmis = +10p</span><br/>
                  <span className="text-red-600">⚫ Palanut = 0p</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}