'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  name: string;
  photoUrl: string;
}

interface MolkkyThrow {
  id: string;
  throwNumber: number;
  pinsHit: number;
  pinNumber?: number;
  points: number;
  scoreBefore: number;
  scoreAfter: number;
  isMiss: boolean;
  isPenalty: boolean;
  createdAt: string;
  player: {
    user: User;
  };
}

interface MolkkyPlayer {
  id: string;
  userId: string;
  user: User;
  currentScore: number;
  missCount: number;
  isEliminated: boolean;
  joinedAt: string;
  throws: MolkkyThrow[];
}

interface MolkkyGame {
  id: string;
  status: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  creator: User;
  winner?: User;
  players: MolkkyPlayer[];
  throws: MolkkyThrow[];
}

export default function MolkkyGamePage({ params }: { params: Promise<{ id: string }> }) {
  const [user, setUser] = useState<User | null>(null);
  const [game, setGame] = useState<MolkkyGame | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [pinsHit, setPinsHit] = useState<number>(0);
  const [pinNumber, setPinNumber] = useState<number>(1);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gameId, setGameId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setGameId(resolvedParams.id);
    };
    
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (!gameId) return;
    
    const checkAuth = () => {
      const storedUser = sessionStorage.getItem('user');
      if (!storedUser) {
        router.push('/signin');
        return;
      }
      
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchGame();
        fetchUsers();
      } catch (error) {
        console.error('Virhe käyttäjätietojen lukemisessa:', error);
        router.push('/signin');
      }
    };

    checkAuth();
    
    // Auto-refresh game state every 5 seconds
    const interval = setInterval(fetchGame, 5000);
    return () => clearInterval(interval);
  }, [gameId, router]);

  const fetchGame = async () => {
    if (!gameId) return;
    try {
      const response = await fetch(`/api/games/molkky/${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setGame(data);
        if (data.players.length > 0 && !selectedPlayer) {
          setSelectedPlayer(data.players[0].id);
        }
      } else if (response.status === 404) {
        router.push('/molkky');
      }
    } catch (error) {
      console.error('Virhe pelin haussa:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/list');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Virhe käyttäjien haussa:', error);
    }
  };

  const addPlayer = async (userId: string) => {
    if (!gameId) return;
    try {
      const response = await fetch(`/api/games/molkky/${gameId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchGame();
        setShowAddPlayer(false);
      }
    } catch (error) {
      console.error('Virhe pelaajan lisäämisessä:', error);
    }
  };

  const removePlayer = async (userId: string) => {
    if (!gameId) return;
    try {
      const response = await fetch(`/api/games/molkky/${gameId}/players`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchGame();
      }
    } catch (error) {
      console.error('Virhe pelaajan poistossa:', error);
    }
  };

  const startGame = async () => {
    if (!gameId) return;
    try {
      const response = await fetch(`/api/games/molkky/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ongoing' }),
      });

      if (response.ok) {
        fetchGame();
      }
    } catch (error) {
      console.error('Virhe pelin aloittamisessa:', error);
    }
  };

  const addThrow = async () => {
    if (!selectedPlayer || !gameId) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/games/molkky/${gameId}/throw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: selectedPlayer,
          pinsHit,
          pinNumber: pinsHit === 1 ? pinNumber : null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setGame(result.game);
        setPinsHit(0);
        setPinNumber(1);
        
        if (result.isGameWon) {
          alert('🏆 Peli päättyi! ' + result.game.winner?.name + ' voitti!');
        } else if (result.isPlayerEliminated) {
          alert('❌ Pelaaja eliminoitui 3 ohiheiton jälkeen!');
        }
      }
    } catch (error) {
      console.error('Virhe heiton lisäämisessä:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isCreator = user && game && user.id === game.creator.id;
  const canModify = isCreator || (user && user.username === 'admin');

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F0FFF0' }}
      >
        <div 
          className="text-2xl"
          style={{ 
            fontFamily: 'Nunito, sans-serif',
            color: '#2F4F4F'
          }}
        >
          Ladataan...
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0FFF0' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p style={{ fontFamily: 'Nunito, sans-serif', color: '#2F4F4F' }}>
            Peliä ei löytynyt
          </p>
        </div>
      </div>
    );
  }

  const availableUsers = allUsers.filter(u => 
    !game.players.some(p => p.userId === u.id)
  );

  const getCurrentPlayer = () => {
    if (game.status !== 'ongoing') return null;
    const activePlayers = game.players.filter(p => !p.isEliminated);
    if (activePlayers.length === 0) return null;
    
    const throwCount = game.throws.length;
    return activePlayers[throwCount % activePlayers.length];
  };

  const currentPlayer = getCurrentPlayer();

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#F0FFF0' }}>
      {/* Forest Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/juhannus2025.png"
          alt="Juhannus 2025 Forest Background"
          fill
          className="object-cover opacity-70"
          quality={100}
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-4 pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              background: 'linear-gradient(135deg, #228B22, #32CD32)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            🎯 Mölkky Peli #{game.id.slice(-6)}
          </h1>
          <p 
            className="text-lg"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#2F4F4F'
            }}
          >
            Luoja: {game.creator.name} • Status: {
              game.status === 'waiting' ? '⏳ Odottaa' :
              game.status === 'ongoing' ? '🎯 Käynnissä' :
              game.status === 'completed' ? '🏆 Päättynyt' : game.status
            }
          </p>
          {game.winner && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p 
                className="text-xl font-bold"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#DAA520'
                }}
              >
                🏆 Voittaja: {game.winner.name}!
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Players & Scoring */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200">
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              🏃‍♂️ Pelaajat ({game.players.length})
            </h2>

            {/* Current Player Indicator */}
            {currentPlayer && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p 
                  className="text-sm font-medium"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: '#228B22'
                  }}
                >
                  🎯 Vuorossa: {currentPlayer.user.name}
                </p>
              </div>
            )}

            {/* Players List */}
            <div className="space-y-3 mb-6">
              {game.players.map((player, index) => (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    currentPlayer?.id === player.id ? 'bg-green-100 border-2 border-green-300' : 
                    player.isEliminated ? 'bg-red-50 border border-red-200' :
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span 
                      className="text-lg font-bold"
                      style={{ color: '#228B22' }}
                    >
                      #{index + 1}
                    </span>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-green-300">
                      <Image
                        src={player.user.photoUrl}
                        alt={player.user.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p 
                        className="font-medium"
                        style={{ 
                          fontFamily: 'Nunito, sans-serif',
                          color: '#2F4F4F'
                        }}
                      >
                        {player.user.name}
                        {player.isEliminated && ' ❌'}
                      </p>
                      <p 
                        className="text-sm opacity-75"
                        style={{ 
                          fontFamily: 'Nunito, sans-serif',
                          color: '#2F4F4F'
                        }}
                      >
                        Ohiheitot: {player.missCount}/3
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: player.currentScore === 50 ? '#DAA520' : '#228B22' }}
                    >
                      {player.currentScore}
                    </p>
                    <p 
                      className="text-xs"
                      style={{ 
                        fontFamily: 'Nunito, sans-serif',
                        color: '#2F4F4F'
                      }}
                    >
                      / 50
                    </p>
                  </div>
                  {canModify && game.status === 'waiting' && (
                    <button
                      onClick={() => removePlayer(player.userId)}
                      className="ml-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Player */}
            {canModify && game.status === 'waiting' && (
              <div className="mb-4">
                {!showAddPlayer ? (
                  <button
                    onClick={() => setShowAddPlayer(true)}
                    className="w-full py-3 px-4 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-all"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    ➕ Lisää Pelaaja
                  </button>
                ) : (
                  <div className="border-2 border-green-300 rounded-lg p-4">
                    <h3 className="font-medium mb-3" style={{ fontFamily: 'Nunito, sans-serif', color: '#228B22' }}>
                      Valitse pelaaja:
                    </h3>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                      {availableUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => addPlayer(user.id)}
                          className="flex items-center space-x-3 p-2 hover:bg-green-50 rounded-lg"
                        >
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-green-300">
                            <Image
                              src={user.photoUrl}
                              alt={user.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span style={{ fontFamily: 'Nunito, sans-serif', color: '#2F4F4F' }}>
                            {user.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowAddPlayer(false)}
                      className="mt-3 w-full py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      Peruuta
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Start Game */}
            {canModify && game.status === 'waiting' && game.players.length >= 2 && (
              <button
                onClick={startGame}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                🚀 Aloita Peli
              </button>
            )}

            {/* Scoring Controls */}
            {canModify && game.status === 'ongoing' && (
              <div className="border-t border-green-200 pt-6">
                <h3 
                  className="text-lg font-bold mb-4"
                  style={{ 
                    fontFamily: 'Fredoka One, cursive',
                    color: '#228B22'
                  }}
                >
                  🎯 Lisää Heitto
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Nunito, sans-serif', color: '#228B22' }}>
                      Pelaaja:
                    </label>
                    <select
                      value={selectedPlayer}
                      onChange={(e) => setSelectedPlayer(e.target.value)}
                      className="w-full p-3 border border-green-200 rounded-lg"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {game.players.filter(p => !p.isEliminated).map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.user.name} ({player.currentScore}p)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Nunito, sans-serif', color: '#228B22' }}>
                      Kaatuneita keiloja:
                    </label>
                    <select
                      value={pinsHit}
                      onChange={(e) => setPinsHit(Number(e.target.value))}
                      className="w-full p-3 border border-green-200 rounded-lg"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {Array.from({ length: 13 }, (_, i) => (
                        <option key={i} value={i}>
                          {i} {i === 0 ? '(ohiheitto)' : i === 1 ? '(yksi keila)' : '(keilaa)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {pinsHit === 1 && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Nunito, sans-serif', color: '#228B22' }}>
                        Kaatunut keila (numero):
                      </label>
                      <select
                        value={pinNumber}
                        onChange={(e) => setPinNumber(Number(e.target.value))}
                        className="w-full p-3 border border-green-200 rounded-lg"
                        style={{ fontFamily: 'Nunito, sans-serif' }}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            Keila {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={addThrow}
                    disabled={submitting || !selectedPlayer}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {submitting ? '🌿 Lisätään...' : '🎯 Lisää Heitto'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Game History */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200">
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              📜 Pelin Historia ({game.throws.length})
            </h2>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {game.throws.slice().reverse().map((throw_) => (
                <div 
                  key={throw_.id}
                  className={`p-3 rounded-lg border ${
                    throw_.isPenalty ? 'bg-red-50 border-red-200' :
                    throw_.isMiss ? 'bg-gray-50 border-gray-200' :
                    throw_.points >= 10 ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p 
                        className="font-medium"
                        style={{ 
                          fontFamily: 'Nunito, sans-serif',
                          color: '#2F4F4F'
                        }}
                      >
                        {throw_.player.user.name}
                      </p>
                      <p 
                        className="text-sm opacity-75"
                        style={{ 
                          fontFamily: 'Nunito, sans-serif',
                          color: '#2F4F4F'
                        }}
                      >
                        Heitto #{throw_.throwNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p 
                        className="text-lg font-bold"
                        style={{ 
                          color: throw_.isPenalty ? '#DC2626' : 
                               throw_.isMiss ? '#6B7280' : '#228B22' 
                        }}
                      >
                        {throw_.isPenalty ? '⚠️ -25p' : 
                         throw_.isMiss ? '❌ 0p' : 
                         `+${throw_.points}p`}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ 
                          fontFamily: 'Nunito, sans-serif',
                          color: '#2F4F4F'
                        }}
                      >
                        {throw_.scoreBefore} → {throw_.scoreAfter}
                      </p>
                    </div>
                  </div>
                  <div 
                    className="text-xs mt-1"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    {throw_.isMiss ? 'Ohiheitto' :
                     throw_.pinsHit === 1 ? `Keila ${throw_.pinNumber}` :
                     `${throw_.pinsHit} keilaa`}
                    {throw_.isPenalty && ' (yli 50p → 25p)'}
                  </div>
                </div>
              ))}
            </div>

            {game.throws.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p 
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: '#2F4F4F'
                  }}
                >
                  Ei heittoja vielä
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}