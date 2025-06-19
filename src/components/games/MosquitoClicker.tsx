'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Mosquito {
  id: string;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  angle: number;
  isSquished: boolean;
  size: number;
  targetingHead: boolean;
}

interface GameStats {
  score: number;
  mosquitoesKilled: number;
  accuracy: number;
  timeElapsed: number;
}

export default function MosquitoClicker() {
  const [mosquitoes, setMosquitoes] = useState<Mosquito[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameTime, setGameTime] = useState(0); // Track elapsed time instead
  const [missedClicks, setMissedClicks] = useState(0);
  const [mosquitoesKilled, setMosquitoesKilled] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [clickCooldown, setClickCooldown] = useState(false);
  const [handPosition, setHandPosition] = useState<{x: number, y: number, visible: boolean}>({x: 0, y: 0, visible: false});
  const [headHealth, setHeadHealth] = useState(100);
  const [difficultyLevel, setDifficultyLevel] = useState(1);

  // Create new mosquito
  const createMosquito = useCallback((currentDifficulty: number = difficultyLevel): Mosquito => {
    const side = Math.floor(Math.random() * 4);
    let x, y, speedX, speedY;
    
    switch(side) {
      case 0: // top
        x = Math.random() * window.innerWidth;
        y = -30;
        speedX = (Math.random() - 0.5) * 8;
        speedY = Math.random() * 4 + 2;
        break;
      case 1: // right
        x = window.innerWidth + 30;
        y = Math.random() * 600;
        speedX = -(Math.random() * 4 + 2);
        speedY = (Math.random() - 0.5) * 8;
        break;
      case 2: // bottom
        x = Math.random() * window.innerWidth;
        y = 630;
        speedX = (Math.random() - 0.5) * 8;
        speedY = -(Math.random() * 4 + 2);
        break;
      default: // left
        x = -30;
        y = Math.random() * 600;
        speedX = Math.random() * 4 + 2;
        speedY = (Math.random() - 0.5) * 8;
        break;
    }

    // 70% chance of targeting head, 30% random movement
    const targetingHead = Math.random() < 0.7;
    const headX = 400; // Center of 800px wide game area
    const headY = 300; // Center of 600px high game area
    
    if (targetingHead) {
      // Calculate direction towards head
      const dx = headX - x;
      const dy = headY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // Speed increases with difficulty level
      const baseSpeed = 1.5 + (currentDifficulty * 0.3);
      const speed = Math.random() * 2 + baseSpeed;
      speedX = (dx / distance) * speed;
      speedY = (dy / distance) * speed;
    }

    return {
      id: `mosquito-${Date.now()}-${Math.random()}`,
      x,
      y,
      speedX,
      speedY,
      angle: Math.random() * 360,
      isSquished: false,
      size: 30 + Math.random() * 20, // 30-50px (smaller)
      targetingHead
    };
  }, [difficultyLevel]);

  // Start game
  const startGame = () => {
    setScore(0);
    setGameTime(0);
    setMissedClicks(0);
    setMosquitoesKilled(0);
    setTotalClicks(0);
    setMosquitoes([]);
    setGameActive(true);
    setGameEnded(false);
    setGameStats(null);
    setHeadHealth(100);
    setClickCooldown(false);
    setHandPosition({x: 0, y: 0, visible: false});
    setDifficultyLevel(1);
  };

  // End game
  const endGame = async () => {
    // Prevent multiple calls
    if (!gameActive || gameEnded) return;
    
    setGameActive(false);
    setGameEnded(true);
    
    const accuracy = totalClicks > 0 ? Math.round((mosquitoesKilled / totalClicks) * 100) : 0;
    const finalStats: GameStats = {
      score,
      mosquitoesKilled,
      accuracy,
      timeElapsed: gameTime
    };
    setGameStats(finalStats);
    
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.id) {
      try {
        await fetch('/api/games/mosquito', {
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

  // Game time tracker and difficulty scaling
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setGameTime(prev => {
        const newTime = prev + 1;
        
        // Increase difficulty every 10 seconds
        if (newTime % 10 === 0) {
          setDifficultyLevel(Math.floor(newTime / 10) + 1);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  // Check for game over when head health reaches 0
  useEffect(() => {
    if (gameActive && headHealth <= 0) {
      endGame();
    }
  }, [gameActive, headHealth]);

  // Spawn mosquitoes with scaling difficulty
  useEffect(() => {
    if (!gameActive) return;

    // Calculate spawn rate and max mosquitoes based on difficulty
    const baseSpawnRate = 800;
    const spawnRate = Math.max(300, baseSpawnRate - (difficultyLevel * 50)); // Faster spawning over time
    const maxMosquitoes = Math.min(25, 8 + (difficultyLevel * 2)); // More mosquitoes over time

    const spawnInterval = setInterval(() => {
      setMosquitoes(prev => {
        const activeMosquitoes = prev.filter(m => !m.isSquished).length;
        if (activeMosquitoes < maxMosquitoes) {
          return [...prev, createMosquito(difficultyLevel)];
        }
        return prev;
      });
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [gameActive, createMosquito, difficultyLevel]);

  // Move mosquitoes
  useEffect(() => {
    if (!gameActive) return;

    const moveInterval = setInterval(() => {
      setMosquitoes(prev => prev.map(mosquito => {
        if (mosquito.isSquished) return mosquito;

        const newX = mosquito.x + mosquito.speedX;
        const newY = mosquito.y + mosquito.speedY;
        let newSpeedX = mosquito.speedX;
        let newSpeedY = mosquito.speedY;

        // Check collision with head (center at 400, 300 with radius of ~50)
        const headX = 400;
        const headY = 300;
        const headRadius = 50;
        const distance = Math.sqrt((newX - headX) ** 2 + (newY - headY) ** 2);
        
        if (distance < headRadius && !mosquito.isSquished) {
          // Mosquito reached the head - damage increases with difficulty
          const damage = 3 + Math.floor(difficultyLevel / 2); // 3-8 damage based on difficulty
          setHeadHealth(prev => Math.max(0, prev - damage));
          setScore(prev => Math.max(0, prev - 10));
          return { ...mosquito, isSquished: true }; // Remove the mosquito
        }

        // For head-targeting mosquitoes, adjust direction towards head occasionally
        if (mosquito.targetingHead && Math.random() < 0.1) {
          const dx = headX - newX;
          const dy = headY - newY;
          const distToHead = Math.sqrt(dx * dx + dy * dy);
          if (distToHead > 0) {
            const speed = Math.sqrt(newSpeedX * newSpeedX + newSpeedY * newSpeedY);
            newSpeedX = (dx / distToHead) * speed;
            newSpeedY = (dy / distToHead) * speed;
          }
        } else if (!mosquito.targetingHead) {
          // Random direction changes for non-targeting mosquitoes
          if (Math.random() < 0.05) {
            newSpeedX += (Math.random() - 0.5) * 4;
            newSpeedY += (Math.random() - 0.5) * 4;
          }
        }

        // Keep speed reasonable
        newSpeedX = Math.max(-8, Math.min(8, newSpeedX));
        newSpeedY = Math.max(-8, Math.min(8, newSpeedY));

        // Calculate angle based on movement direction
        const angle = Math.atan2(newSpeedY, newSpeedX) * (180 / Math.PI) + 90;

        return {
          ...mosquito,
          x: newX,
          y: newY,
          speedX: newSpeedX,
          speedY: newSpeedY,
          angle
        };
      }).filter(m => {
        // Remove mosquitoes that are far off screen or squished for > 1 second
        if (m.isSquished) return true; // Keep for animation
        return m.x > -200 && m.x < 800 + 200 && 
               m.y > -200 && m.y < 800;
      }));
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameActive]);

  // Clean up squished mosquitoes
  useEffect(() => {
    if (!gameActive) return;

    const cleanupInterval = setInterval(() => {
      setMosquitoes(prev => prev.filter(m => !m.isSquished));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, [gameActive]);

  const handleMosquitoClick = (id: string, event: React.MouseEvent) => {
    if (clickCooldown) return;
    
    setMosquitoes(prev => prev.map(m => 
      m.id === id ? { ...m, isSquished: true } : m
    ));
    setScore(prev => prev + 10);
    setMosquitoesKilled(prev => prev + 1);
    setTotalClicks(prev => prev + 1);
    
    // Show hand animation
    showHandAnimation(event.clientX, event.clientY);
  };

  const handleMissClick = (event: React.MouseEvent) => {
    if (!gameActive || clickCooldown) return;
    
    setMissedClicks(prev => prev + 1);
    setTotalClicks(prev => prev + 1);
    // No score penalty for missing
    
    // Show hand animation
    showHandAnimation(event.clientX, event.clientY);
  };

  const showHandAnimation = (x: number, y: number) => {
    // Convert screen coordinates to game area coordinates
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      const rect = gameArea.getBoundingClientRect();
      const relativeX = x - rect.left;
      const relativeY = y - rect.top;
      
      setHandPosition({ x: relativeX, y: relativeY, visible: true });
      setClickCooldown(true);
      
      // Hide hand and reset cooldown after animation
      setTimeout(() => {
        setHandPosition(prev => ({ ...prev, visible: false }));
        setClickCooldown(false);
      }, 300);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-green-50 border-4 border-green-800 rounded-lg p-6">
        <h2 className="text-3xl font-fredoka text-green-800 text-center mb-4">
          Hyttysjahtaaja
        </h2>

        {!gameActive && !gameEnded ? (
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              Suojele päätäsi hyttysten hyökkäykseltä!
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Hyttyset yrittävät päästä päähäsi imemään verta. Estä ne! 🦟<br/>
              Klikkaus on rajoitettu - älä turhaan räiskäile!
            </p>
            <button
              onClick={startGame}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Aloita peli
            </button>
          </div>
        ) : gameEnded && gameStats ? (
          <div className="text-center">
            <h3 className="text-3xl font-bold text-green-800 mb-6">
              🎯 Peli päättyi!
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                <div className="text-2xl font-bold text-green-700">{gameStats.score}</div>
                <div className="text-sm text-gray-600">Pisteet</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-red-300">
                <div className="text-2xl font-bold text-red-700">{gameStats.mosquitoesKilled}</div>
                <div className="text-sm text-gray-600">Hyttysiä</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                <div className="text-2xl font-bold text-blue-700">{gameStats.accuracy}%</div>
                <div className="text-sm text-gray-600">Tarkkuus</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                <div className="text-2xl font-bold text-purple-700">{gameStats.timeElapsed}s</div>
                <div className="text-sm text-gray-600">Selviytyminen</div>
              </div>
            </div>
            
            <div className="mb-6">
              {gameStats.timeElapsed >= 60 ? (
                <div className="text-green-600 text-lg font-bold">
                  🏆 Erinomainen! Selvisit yli minuutin! Hyttysjahtaja!
                </div>
              ) : gameStats.timeElapsed >= 30 ? (
                <div className="text-blue-600 text-lg font-bold">
                  👍 Hyvä suoritus! Kestit puoli minuuttia!
                </div>
              ) : (
                <div className="text-red-600 text-lg font-bold">
                  🦟 Hyttyset voittivat tällä kertaa! Yritä uudestaan!
                </div>
              )}
            </div>
            
            <button
              onClick={startGame}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Pelaa uudestaan
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 text-center">
              <div className="text-xl font-bold text-green-800">
                Pisteet: {score}
              </div>
              <div className="text-lg text-gray-600">
                Hutit: {missedClicks}
              </div>
              <div className="text-lg font-bold">
                <span className="text-red-600">❤️ Pää: {headHealth}%</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                🏃 Vaikeus: {difficultyLevel}
              </div>
              <div className="text-lg font-bold text-blue-600">
                ⏱️ {gameTime}s
              </div>
            </div>

            <div 
              className="relative bg-gradient-to-b from-blue-100 to-green-100 rounded-lg h-[600px] overflow-hidden cursor-crosshair game-area"
              onClick={handleMissClick}
            >
              {/* Head in the center */}
              <div 
                className="absolute"
                style={{
                  left: 400 - 32, // Center at 400, head is 64px wide
                  top: 300 - 32,  // Center at 300, head is 64px tall
                  width: 64,
                  height: 64,
                  zIndex: 1
                }}
              >
                <Image
                  src="/head.png"
                  alt="Pää"
                  width={64}
                  height={64}
                  className="rounded-full"
                  draggable={false}
                />
              </div>
              {mosquitoes.map(mosquito => (
                <div
                  key={mosquito.id}
                  className={`absolute transition-all ${mosquito.isSquished ? 'duration-300' : 'duration-0'}`}
                  style={{
                    left: mosquito.x - mosquito.size / 2,
                    top: mosquito.y - mosquito.size / 2,
                    width: mosquito.size,
                    height: mosquito.size,
                    transform: `rotate(${mosquito.angle}deg) ${mosquito.isSquished ? 'scale(0.8)' : ''}`,
                    opacity: mosquito.isSquished ? 0 : 1
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!mosquito.isSquished) {
                      handleMosquitoClick(mosquito.id, e);
                    }
                  }}
                >
                  {!mosquito.isSquished ? (
                    <Image
                      src="/mosquito.png"
                      alt="Hyttynen"
                      width={mosquito.size}
                      height={mosquito.size}
                      className="cursor-pointer hover:scale-110 transition-transform"
                      draggable={false}
                    />
                  ) : (
                    <Image
                      src="/mosquito-splat.png"
                      alt="Läiskä"
                      width={mosquito.size}
                      height={mosquito.size}
                      draggable={false}
                    />
                  )}
                </div>
              ))}

              {/* Hand animation */}
              {handPosition.visible && (
                <div
                  className="absolute pointer-events-none transition-all duration-300"
                  style={{
                    left: handPosition.x - 24,
                    top: handPosition.y - 24,
                    width: 48,
                    height: 48,
                    zIndex: 10,
                    transform: 'scale(1.2)',
                    opacity: 0.8
                  }}
                >
                  <Image
                    src="/hand.png"
                    alt="Käsi"
                    width={48}
                    height={48}
                    draggable={false}
                  />
                </div>
              )}

              {/* Click feedback */}
              <div className="absolute top-4 left-4 bg-white/80 p-3 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">
                  💯 Osuma = +10p<br/>
                  🦟 Päälle = -10p & -{3 + Math.floor(difficultyLevel / 2)}% ❤️<br/>
                  ⏱️ Vaikeus nousee 10s välein<br/>
                  🎯 Tavoite: Kestä 60 sekuntia!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}