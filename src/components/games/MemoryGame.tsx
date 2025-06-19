'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Card {
  id: string;
  image: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameStats {
  score: number;
  moves: number;
  timeElapsed: number;
  matches: number;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  // Card themes with Finnish Juhannus elements
  const cardThemes = [
    { image: '/memory-bonfire.png', name: 'Kokko' },
    { image: '/memory-birch.png', name: 'Koivu' },
    { image: '/memory-flowers.png', name: 'Kukkaseppele' },
    { image: '/memory-cabin.png', name: 'Mökki' },
    { image: '/memory-sauna.png', name: 'Sauna' },
    { image: '/memory-sun.png', name: 'Keskiyön aurinko' },
    { image: '/memory-boat.png', name: 'Vene' },
    { image: '/memory-pole.png', name: 'Juhannussalko' }
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    // Create pairs of cards
    const gameCards: Card[] = [];
    cardThemes.forEach((theme, index) => {
      // Create two cards for each theme
      gameCards.push({
        id: `${index}-1`,
        image: theme.image,
        name: theme.name,
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: `${index}-2`,
        image: theme.image,
        name: theme.name,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  }, []);

  // Start game
  const startGame = () => {
    initializeGame();
    setGameActive(true);
    setGameEnded(false);
    setMoves(0);
    setMatches(0);
    setGameTime(0);
    setFlippedCards([]);
    setGameStats(null);
  };

  // End game
  const endGame = async () => {
    if (!gameActive || gameEnded) return;
    
    setGameActive(false);
    setGameEnded(true);
    
    // Calculate score based on moves and time
    const baseScore = 1000;
    const movePenalty = moves * 10;
    const timePenalty = gameTime * 2;
    const finalScore = Math.max(100, baseScore - movePenalty - timePenalty);
    
    const finalStats: GameStats = {
      score: finalScore,
      moves,
      timeElapsed: gameTime,
      matches: matches
    };
    setGameStats(finalStats);
    
    // Save score to database
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.id) {
      try {
        await fetch('/api/games/memory', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': user.id
          },
          body: JSON.stringify({ score: finalScore })
        });
      } catch (error) {
        console.error('Failed to save score:', error);
      }
    }
  };

  // Handle card click
  const handleCardClick = (clickedCard: Card) => {
    if (!gameActive || clickedCard.isFlipped || clickedCard.isMatched || flippedCards.length >= 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    // Flip the card
    setCards(prev => prev.map(card => 
      card.id === clickedCard.id 
        ? { ...card, isFlipped: true }
        : card
    ));

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      if (newFlippedCards[0].name === newFlippedCards[1].name) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.some(flipped => flipped.id === card.id)
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
        }, 1000);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.some(flipped => flipped.id === card.id)
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1500);
      }
    }
  };

  // Game timer
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  // Check for game completion
  useEffect(() => {
    if (gameActive && matches === cardThemes.length) {
      endGame();
    }
  }, [gameActive, matches, cardThemes.length]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-green-50 border-4 border-green-800 rounded-lg p-6">
        <h2 
          className="text-3xl font-bold text-center mb-4"
          style={{ 
            fontFamily: 'Fredoka One, cursive',
            color: '#228B22'
          }}
        >
          🌿 Juhannus Muistipeli
        </h2>

        {!gameActive && !gameEnded ? (
          <div className="text-center">
            <p 
              className="text-lg mb-4"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Löydä parit Juhannus-teemaisista korteista!
            </p>
            <p 
              className="text-sm mb-6"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Käännä kortteja ja etsi samoja kuvia. Vähemmän siirtoja = parempi tulos! 🃏
            </p>
            <button
              onClick={startGame}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              🎯 Aloita peli
            </button>
          </div>
        ) : gameEnded && gameStats ? (
          <div className="text-center">
            <h3 
              className="text-3xl font-bold mb-6"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              🎉 Onneksi olkoon!
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                <div className="text-2xl font-bold text-green-700">{gameStats.score}</div>
                <div className="text-sm text-gray-600">Pisteet</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                <div className="text-2xl font-bold text-blue-700">{gameStats.moves}</div>
                <div className="text-sm text-gray-600">Siirrot</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                <div className="text-2xl font-bold text-purple-700">{gameStats.timeElapsed}s</div>
                <div className="text-sm text-gray-600">Aika</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-300">
                <div className="text-2xl font-bold text-yellow-700">{gameStats.matches}/8</div>
                <div className="text-sm text-gray-600">Parit</div>
              </div>
            </div>
            
            <div className="mb-6">
              {gameStats.moves <= 20 ? (
                <div className="text-green-600 text-lg font-bold">
                  🏆 Erinomainen muisti! Juhannus-mestari!
                </div>
              ) : gameStats.moves <= 30 ? (
                <div className="text-blue-600 text-lg font-bold">
                  👍 Hyvä suoritus! Vahva muisti!
                </div>
              ) : (
                <div className="text-yellow-600 text-lg font-bold">
                  😊 Hyvä yritys! Harjoittele lisää!
                </div>
              )}
            </div>
            
            <button
              onClick={startGame}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              🔄 Pelaa uudestaan
            </button>
          </div>
        ) : (
          <>
            {/* Game stats */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ 
                    fontFamily: 'Fredoka One, cursive',
                    color: '#228B22'
                  }}
                >
                  {moves}
                </div>
                <div 
                  className="text-sm"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: '#2F4F4F'
                  }}
                >
                  Siirrot
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ 
                    fontFamily: 'Fredoka One, cursive',
                    color: '#DAA520'
                  }}
                >
                  {matches}/8
                </div>
                <div 
                  className="text-sm"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: '#2F4F4F'
                  }}
                >
                  Parit
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ 
                    fontFamily: 'Fredoka One, cursive',
                    color: '#32CD32'
                  }}
                >
                  {gameTime}s
                </div>
                <div 
                  className="text-sm"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: '#2F4F4F'
                  }}
                >
                  Aika
                </div>
              </div>
            </div>

            {/* Game board */}
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`relative aspect-square rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                    card.isMatched ? 'opacity-50' : ''
                  }`}
                  style={{
                    perspective: '1000px'
                  }}
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500`}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* Card back */}
                    <div
                      className="absolute inset-0 rounded-lg border-2 border-green-300 bg-white shadow-lg flex items-center justify-center"
                      style={{
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      <Image
                        src="/memory-card-back.png"
                        alt="Kortin taksi"
                        width={100}
                        height={100}
                        className="rounded-lg"
                        draggable={false}
                      />
                    </div>
                    
                    {/* Card front */}
                    <div
                      className="absolute inset-0 rounded-lg border-2 border-green-400 bg-white shadow-lg flex flex-col items-center justify-center p-2"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <Image
                        src={card.image}
                        alt={card.name}
                        width={80}
                        height={80}
                        className="rounded-lg mb-1"
                        draggable={false}
                      />
                      <p 
                        className="text-xs text-center font-medium"
                        style={{ 
                          fontFamily: 'Nunito, sans-serif',
                          color: '#2F4F4F'
                        }}
                      >
                        {card.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Helpful tips */}
            <div className="mt-6 text-center">
              <p 
                className="text-sm"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                💡 Vihje: Muista korttien paikat paremman tuloksen saamiseksi!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}