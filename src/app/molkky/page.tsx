'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  name: string;
  photoUrl: string;
}

interface MolkkyPlayer {
  id: string;
  userId: string;
  user: User;
  currentScore: number;
  missCount: number;
  isEliminated: boolean;
  joinedAt: string;
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
  _count: {
    throws: number;
  };
}

export default function MolkkyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<MolkkyGame[]>([]);
  const [_allUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = sessionStorage.getItem('user');
      if (!storedUser) {
        router.push('/signin');
        return;
      }
      
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchGames();
        fetchUsers();
      } catch (error) {
        console.error('Virhe käyttäjätietojen lukemisessa:', error);
        router.push('/signin');
      }
    };

    checkAuth();
  }, [router]);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games/molkky');
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error('Virhe pelien haussa:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/list');
      if (response.ok) {
        const _data = await response.json();
        // setAllUsers(data); // Not using this data
      }
    } catch (error) {
      console.error('Virhe käyttäjien haussa:', error);
    }
  };

  const createGame = async () => {
    if (!user) return;
    
    setCreating(true);
    try {
      const response = await fetch('/api/games/molkky', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorId: user.id }),
      });

      if (response.ok) {
        const newGame = await response.json();
        router.push(`/molkky/${newGame.id}`);
      }
    } catch (error) {
      console.error('Virhe pelin luonnissa:', error);
    } finally {
      setCreating(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return '⏳ Odottaa pelaajia';
      case 'ongoing': return '🎯 Käynnissä';
      case 'completed': return '🏆 Päättynyt';
      case 'cancelled': return '❌ Peruttu';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return '#DAA520';
      case 'ongoing': return '#228B22';
      case 'completed': return '#32CD32';
      case 'cancelled': return '#DC2626';
      default: return '#2F4F4F';
    }
  };

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
            className="text-5xl font-bold mb-4"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              background: 'linear-gradient(135deg, #228B22, #32CD32)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            🎯 Mölkky Turnaus
          </h1>
          <p 
            className="text-xl mb-6"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#2F4F4F'
            }}
          >
            Perinteinen suomalainen juhannuspeli - ensimmäinen 50 pisteeseen voittaa!
          </p>
          
          <button
            onClick={createGame}
            disabled={creating}
            className="px-8 py-4 text-white rounded-lg font-medium hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              backgroundColor: '#228B22'
            }}
          >
            {creating ? '🌿 Luodaan peliä...' : '🎯 Luo Uusi Peli'}
          </button>
        </div>

        {/* Game Rules */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-8 border border-green-200">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              color: '#228B22'
            }}
          >
            🌿 Mölkky Säännöt
          </h2>
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#2F4F4F'
            }}
          >
            <div>
              <p className="mb-2">🎯 <strong>Tavoite:</strong> Saa tasan 50 pistettä ensimmäisenä</p>
              <p className="mb-2">📍 <strong>Pisteytys:</strong> 1 keila = keilassa oleva numero</p>
              <p className="mb-2">🎳 <strong>Useampi keila:</strong> Pisteet = kaatuneiden keilojen määrä</p>
            </div>
            <div>
              <p className="mb-2">⚠️ <strong>Yli 50 pistettä:</strong> Palaa takaisin 25 pisteeseen</p>
              <p className="mb-2">❌ <strong>Ohiheitto:</strong> 0 pistettä</p>
              <p className="mb-2">🚫 <strong>3 ohiheittoa peräkkäin:</strong> Eliminoituminen</p>
            </div>
          </div>
        </div>

        {/* Games List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200 hover:border-green-400 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 
                    className="text-xl font-bold"
                    style={{ 
                      fontFamily: 'Fredoka One, cursive',
                      color: '#228B22'
                    }}
                  >
                    Peli #{game.id.slice(-6)}
                  </h3>
                  <p 
                    className="text-sm opacity-75"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    Luoja: {game.creator.name}
                  </p>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${getStatusColor(game.status)}20`,
                    color: getStatusColor(game.status),
                    fontFamily: 'Nunito, sans-serif'
                  }}
                >
                  {getStatusText(game.status)}
                </span>
              </div>

              {/* Players */}
              <div className="mb-4">
                <p 
                  className="text-sm font-medium mb-2"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: '#228B22'
                  }}
                >
                  Pelaajat ({game.players.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {game.players.slice(0, 6).map((player) => (
                    <div 
                      key={player.id}
                      className="flex items-center space-x-2 bg-green-50 rounded-lg px-3 py-1"
                    >
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-green-300">
                        <Image
                          src={player.user.photoUrl}
                          alt={player.user.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span 
                        className="text-sm"
                        style={{ 
                          fontFamily: 'Nunito, sans-serif',
                          color: '#2F4F4F'
                        }}
                      >
                        {player.user.name}
                      </span>
                      {game.status !== 'waiting' && (
                        <span 
                          className="text-xs font-bold"
                          style={{ color: '#228B22' }}
                        >
                          {player.currentScore}p
                        </span>
                      )}
                      {player.isEliminated && (
                        <span className="text-xs">❌</span>
                      )}
                    </div>
                  ))}
                  {game.players.length > 6 && (
                    <span 
                      className="text-sm"
                      style={{ 
                        fontFamily: 'Nunito, sans-serif',
                        color: '#2F4F4F'
                      }}
                    >
                      +{game.players.length - 6} muuta
                    </span>
                  )}
                </div>
              </div>

              {/* Winner */}
              {game.winner && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p 
                    className="text-sm font-medium"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#DAA520'
                    }}
                  >
                    🏆 Voittaja: {game.winner.name}
                  </p>
                </div>
              )}

              {/* Game Info */}
              <div className="text-xs mb-4" style={{ fontFamily: 'Nunito, sans-serif', color: '#2F4F4F' }}>
                <p>Luotu: {new Date(game.createdAt).toLocaleString('fi-FI')}</p>
                {game.startedAt && (
                  <p>Aloitettu: {new Date(game.startedAt).toLocaleString('fi-FI')}</p>
                )}
                {game.endedAt && (
                  <p>Päättynyt: {new Date(game.endedAt).toLocaleString('fi-FI')}</p>
                )}
                <p>Heittoja: {game._count.throws}</p>
              </div>

              {/* Action Button */}
              <Link 
                href={`/molkky/${game.id}`}
                className="w-full block text-center py-3 px-4 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  backgroundColor: getStatusColor(game.status),
                  color: 'white'
                }}
              >
                {game.status === 'waiting' ? '🎯 Liity Peliin' : 
                 game.status === 'ongoing' ? '👀 Seuraa Peliä' : 
                 '📊 Katso Tulokset'}
              </Link>
            </div>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p 
              className="text-xl mb-4"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Ei Mölkky-pelejä vielä
            </p>
            <p 
              className="text-sm opacity-75"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Ole ensimmäinen, joka aloittaa juhannuksen Mölkky-turnauksen!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}