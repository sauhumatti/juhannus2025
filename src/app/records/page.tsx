"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Leaderboard from "@/components/Leaderboard";

interface GameScore {
  id: string;
  score?: number;
  time?: number;
  createdAt: string;
}

interface BeerPongStats {
  wins: number;
  losses: number;
  winStreak: number;
  bestStreak: number;
  recentMatches: {
    id: string;
    createdAt: string;
    won: boolean;
    opponents: { name: string }[];
  }[];
}

interface MolkkyStats {
  gamesWon: number;
  totalGames: number;
  averagePosition: number;
  recentGames: {
    id: string;
    createdAt: string;
    position: number;
    totalPlayers: number;
  }[];
}

interface Records {
  dartScores: GameScore[];
  puttingScores: GameScore[];
  grillScores: GameScore[];
  mosquitoScores: GameScore[];
  memoryScores: GameScore[];
  beerPongStats?: BeerPongStats;
  molkkyStats?: MolkkyStats;
}

interface LeaderboardEntry {
  id: string;
  score?: number;
  time?: number;
  user: {
    name: string;
    username: string;
    photoUrl: string;
  };
  createdAt: string;
}

const games = [
  { 
    id: "darts", 
    name: "Tikanheitto", 
    icon: "🎯", 
    maxScore: 50,
    type: "score",
    color: "from-green-400 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  { 
    id: "putting", 
    name: "Puttaus", 
    icon: "⛳", 
    maxScore: 10,
    type: "score",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  { 
    id: "beerpong", 
    name: "Beer Pong", 
    icon: "🍺", 
    maxScore: null,
    type: "wins",
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  { 
    id: "molkky", 
    name: "Mölkky", 
    icon: "🎲", 
    maxScore: null,
    type: "placement",
    color: "from-yellow-400 to-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  { 
    id: "grill", 
    name: "Grillimestari", 
    icon: "🔥", 
    maxScore: null,
    type: "score",
    color: "from-red-400 to-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  { 
    id: "mosquito", 
    name: "Hyttysjahtaaja", 
    icon: "🦟", 
    maxScore: null,
    type: "score",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  { 
    id: "memory", 
    name: "Muistipeli", 
    icon: "🃏", 
    maxScore: null,
    type: "score",
    color: "from-indigo-400 to-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
];

export default function Records() {
  const [activeTab, setActiveTab] = useState("darts");
  const [viewMode, setViewMode] = useState<"personal" | "leaderboard">("personal");
  const [records, setRecords] = useState<Records | null>(null);
  const [leaderboards, setLeaderboards] = useState<{ [key: string]: LeaderboardEntry[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        if (!user.id) {
          router.push("/signin");
          return;
        }

        if (viewMode === "personal") {
          const scoresRes = await fetch(`/api/users/records?userId=${user.id}`);
          if (!scoresRes.ok) throw new Error("Failed to fetch records");
          const scoresData = await scoresRes.json();
          setRecords(scoresData);
        } else {
          // Fetch leaderboards
          setRecords(null);
          
          const gameMap: { [key: string]: string } = {
            darts: "darts",
            putting: "putting",
            grill: "grill",
            mosquito: "mosquito",
            memory: "memory"
          };
          
          // Skip API call for games that don't have traditional leaderboards
          if (!gameMap[activeTab]) {
            setLeaderboards({ [activeTab]: [] });
            return;
          }
          
          const res = await fetch(`/api/games/${gameMap[activeTab]}`);
          if (!res.ok) throw new Error("Failed to fetch leaderboard");
          const data = await res.json();
          // The API returns the array directly, not as data.leaderboard
          setLeaderboards({ [activeTab]: data });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading game data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, activeTab, viewMode]);

  const getStats = (scores: GameScore[]) => {
    if (!scores || scores.length === 0) return null;

    if ('score' in scores[0]) {
      const allScores = scores.map(s => s.score!);
      return {
        best: Math.max(...allScores),
        average: Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10,
        total: scores.length,
      };
    } else {
      const allTimes = scores.map(s => s.time!);
      return {
        best: Math.min(...allTimes),
        average: Math.round((allTimes.reduce((a, b) => a + b, 0) / allTimes.length) * 100) / 100,
        total: scores.length,
      };
    }
  };

  const renderPersonalRecords = (scores: GameScore[], game: typeof games[0]) => {
    if (game.type === "score") {
      return renderScoreRecords(scores, game);
    }
    return null;
  };

  const renderScoreRecords = (scores: GameScore[], game: typeof games[0]) => {
    const stats = getStats(scores);
    
    return (
      <div>
        <div className="flex items-center justify-center mb-6">
          <div className={`bg-gradient-to-br ${game.color} rounded-full w-16 h-16 flex items-center justify-center text-3xl mr-4`}>
            {game.icon}
          </div>
          <h3 
            className="text-2xl font-bold"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              color: '#228B22'
            }}
          >
            {game.name} Tulokset
          </h3>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
              <p 
                className="text-sm font-medium mb-1"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                Paras tulos
              </p>
              <p 
                className="text-2xl font-bold"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                {stats.best}{game.maxScore ? `/${game.maxScore}` : ' pistettä'}
              </p>
            </div>
            <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
              <p 
                className="text-sm font-medium mb-1"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                Keskiarvo
              </p>
              <p 
                className="text-2xl font-bold"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                {stats.average}{game.maxScore ? `/${game.maxScore}` : ' pistettä'}
              </p>
            </div>
            <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
              <p 
                className="text-sm font-medium mb-1"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                Pelatut pelit
              </p>
              <p 
                className="text-2xl font-bold"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                {stats.total}
              </p>
            </div>
          </div>
        )}

        {/* Mobile-friendly table */}
        <div className="space-y-3">
          <h4 
            className="text-lg font-bold mb-4"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#228B22'
            }}
          >
            📊 Viimeisimmät tulokset:
          </h4>
          {scores.slice(0, 10).map((score, index) => (
            <div 
              key={score.id} 
              className="flex justify-between items-center p-3 bg-white border border-green-100 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span 
                  className="text-sm font-bold text-green-600 bg-green-100 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  #{index + 1}
                </span>
                <span 
                  className="text-lg font-bold"
                  style={{ 
                    fontFamily: 'Fredoka One, cursive',
                    color: '#228B22'
                  }}
                >
                  {score.score}{game.maxScore ? `/${game.maxScore}` : ''} pistettä
                </span>
              </div>
              <span 
                className="text-sm"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                {new Date(score.createdAt).toLocaleDateString('fi-FI', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
          {scores.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p 
                className="text-lg"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                Ei tuloksia vielä. Pelaa ensimmäinen kierros!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBeerPongRecords = (stats: BeerPongStats, game: typeof games[0]) => {
    const winPercentage = stats.wins + stats.losses > 0 
      ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) 
      : 0;

    return (
      <div>
        <div className="flex items-center justify-center mb-6">
          <div className={`bg-gradient-to-br ${game.color} rounded-full w-16 h-16 flex items-center justify-center text-3xl mr-4`}>
            {game.icon}
          </div>
          <h3 
            className="text-2xl font-bold"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              color: '#228B22'
            }}
          >
            {game.name} Tilastot
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Voitot
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              {stats.wins}
            </p>
          </div>
          <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Voitto-%
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              {winPercentage}%
            </p>
          </div>
          <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Putki
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              {stats.winStreak}
            </p>
          </div>
          <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Paras putki
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              {stats.bestStreak}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 
            className="text-lg font-bold mb-4"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#228B22'
            }}
          >
            🍺 Viimeisimmät ottelut:
          </h4>
          {stats.recentMatches.map((match) => (
            <div 
              key={match.id} 
              className={`flex justify-between items-center p-3 border rounded-lg shadow-sm ${
                match.won ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span 
                  className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center ${
                    match.won ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {match.won ? '🏆' : '❌'}
                </span>
                <div>
                  <span 
                    className="text-lg font-bold"
                    style={{ 
                      fontFamily: 'Fredoka One, cursive',
                      color: match.won ? '#15803d' : '#dc2626'
                    }}
                  >
                    {match.won ? 'Voitto' : 'Tappio'}
                  </span>
                  {match.opponents.length > 0 && (
                    <p 
                      className="text-sm"
                      style={{ 
                        fontFamily: 'Nunito, sans-serif',
                        color: '#2F4F4F'
                      }}
                    >
                      vs. {match.opponents.map(o => o.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <span 
                className="text-sm"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                {new Date(match.createdAt).toLocaleDateString('fi-FI', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
          {stats.recentMatches.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🍺</div>
              <p 
                className="text-lg"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                Ei otteluita vielä. Aloita ensimmäinen peli!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMolkkyRecords = (stats: MolkkyStats, game: typeof games[0]) => {
    const winPercentage = stats.totalGames > 0 
      ? Math.round((stats.gamesWon / stats.totalGames) * 100) 
      : 0;

    return (
      <div>
        <div className="flex items-center justify-center mb-6">
          <div className={`bg-gradient-to-br ${game.color} rounded-full w-16 h-16 flex items-center justify-center text-3xl mr-4`}>
            {game.icon}
          </div>
          <h3 
            className="text-2xl font-bold"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              color: '#228B22'
            }}
          >
            {game.name} Tilastot
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Voitot
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              {stats.gamesWon}
            </p>
          </div>
          <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Voitto-%
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              {winPercentage}%
            </p>
          </div>
          <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Pelattu
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              {stats.totalGames}
            </p>
          </div>
          <div className={`${game.bgColor} border ${game.borderColor} p-4 rounded-lg text-center`}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Keskisijoitus
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              {stats.averagePosition}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 
            className="text-lg font-bold mb-4"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#228B22'
            }}
          >
            🎲 Viimeisimmät pelit:
          </h4>
          {stats.recentGames.map((game) => (
            <div 
              key={game.id} 
              className={`flex justify-between items-center p-3 border rounded-lg shadow-sm ${
                game.position === 1 ? 'bg-yellow-50 border-yellow-200' : 
                game.position <= 3 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span 
                  className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center ${
                    game.position === 1 ? 'text-yellow-600 bg-yellow-100' : 
                    game.position <= 3 ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-100'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {game.position === 1 ? '🥇' : game.position === 2 ? '🥈' : game.position === 3 ? '🥉' : game.position}
                </span>
                <div>
                  <span 
                    className="text-lg font-bold"
                    style={{ 
                      fontFamily: 'Fredoka One, cursive',
                      color: game.position === 1 ? '#ca8a04' : 
                             game.position <= 3 ? '#2563eb' : '#4b5563'
                    }}
                  >
                    {game.position}. sija
                  </span>
                  <p 
                    className="text-sm"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    {game.totalPlayers} pelaajaa
                  </p>
                </div>
              </div>
              <span 
                className="text-sm"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                {new Date(game.createdAt).toLocaleDateString('fi-FI', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
          {stats.recentGames.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎲</div>
              <p 
                className="text-lg"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                Ei pelejä vielä. Aloita ensimmäinen peli!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0FFF0' }}>
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏆</div>
          <div 
            className="text-xl"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#2F4F4F'
            }}
          >
            Ladataan tuloksia...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative records-page" style={{ backgroundColor: '#F0FFF0' }}>
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
            🏆 {viewMode === "personal" ? "Omat Tulokset" : "Tulostaulukko"}
          </h1>
          <p 
            className="text-xl md:text-2xl mb-6"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              color: '#DAA520'
            }}
          >
            Juhannus 2025 pelisuoritukset 🌲
          </p>

          {/* View mode toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 border border-green-200 shadow-md">
              <button
                onClick={() => setViewMode("personal")}
                className={`px-6 py-3 rounded-md font-bold transition-all ${
                  viewMode === "personal" 
                    ? "bg-green-600 text-white shadow-md" 
                    : "text-green-700 hover:bg-green-50"
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                👤 Omat tulokset
              </button>
              <button
                onClick={() => setViewMode("leaderboard")}
                className={`px-6 py-3 rounded-md font-bold transition-all ${
                  viewMode === "leaderboard" 
                    ? "bg-green-600 text-white shadow-md" 
                    : "text-green-700 hover:bg-green-50"
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                🏆 Tulostaulukko
              </button>
            </div>
          </div>
        </div>

        {/* Game Selection Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveTab(game.id)}
              className={`group p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeTab === game.id 
                  ? 'bg-white shadow-lg border-2 border-green-400' 
                  : 'bg-white/80 backdrop-blur-sm border border-green-200 hover:bg-white'
              }`}
            >
              <div className={`bg-gradient-to-br ${game.color} rounded-full w-12 h-12 flex items-center justify-center text-2xl mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                {game.icon}
              </div>
              <h3 
                className={`text-sm font-bold text-center ${
                  activeTab === game.id ? 'text-green-800' : 'text-gray-700'
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {game.name}
              </h3>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-green-200 shadow-lg overflow-hidden">
          {viewMode === "personal" && records ? (
            <div className="p-6">
              {/* Personal Records */}
              {activeTab === "darts" && records.dartScores && 
                renderPersonalRecords(records.dartScores, games.find(g => g.id === "darts")!)
              }
              {activeTab === "putting" && records.puttingScores && 
                renderPersonalRecords(records.puttingScores, games.find(g => g.id === "putting")!)
              }
              {activeTab === "grill" && records.grillScores && 
                renderPersonalRecords(records.grillScores, games.find(g => g.id === "grill")!)
              }
              {activeTab === "mosquito" && records.mosquitoScores && 
                renderPersonalRecords(records.mosquitoScores, games.find(g => g.id === "mosquito")!)
              }
              {activeTab === "memory" && records.memoryScores && 
                renderPersonalRecords(records.memoryScores, games.find(g => g.id === "memory")!)
              }
              {activeTab === "beerpong" && (
                records.beerPongStats ? 
                  renderBeerPongRecords(records.beerPongStats, games.find(g => g.id === "beerpong")!) :
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🍺</div>
                    <p 
                      className="text-lg"
                      style={{ 
                        fontFamily: 'Nunito, sans-serif',
                        color: '#2F4F4F'
                      }}
                    >
                      Ei Beer Pong -tilastoja vielä. Pelaa ensimmäinen ottelu!
                    </p>
                  </div>
              )}
              {activeTab === "molkky" && (
                records.molkkyStats ? 
                  renderMolkkyRecords(records.molkkyStats, games.find(g => g.id === "molkky")!) :
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🎲</div>
                    <p 
                      className="text-lg"
                      style={{ 
                        fontFamily: 'Nunito, sans-serif',
                        color: '#2F4F4F'
                      }}
                    >
                      Ei Mölkky -tilastoja vielä. Pelaa ensimmäinen peli!
                    </p>
                  </div>
              )}
            </div>
          ) : viewMode === "leaderboard" && leaderboards[activeTab] ? (
            <div className="p-6">
              <h3 
                className="text-2xl font-bold mb-6 text-center"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                🏆 Top 10 Pelaajat
              </h3>
              {leaderboards[activeTab].length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <p 
                    className="text-lg"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    Ei tuloksia vielä tässä pelissä
                  </p>
                </div>
              ) : (
                <Leaderboard 
                  scores={leaderboards[activeTab].slice(0, 10)} 
                  type="points" 
                  maxScore={games.find(g => g.id === activeTab)?.maxScore || undefined} 
                />
              )}
            </div>
          ) : viewMode === "leaderboard" && (activeTab === "beerpong" || activeTab === "molkky") ? (
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">
                {activeTab === "beerpong" ? "🍺" : "🎲"}
              </div>
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                {activeTab === "beerpong" ? "Beer Pong" : "Mölkky"} Tulostaulukko
              </h3>
              <p 
                className="text-lg"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                {activeTab === "beerpong" 
                  ? "Beer Pong käyttää voitto/tappio-tilastoja. Katso henkilökohtaisia tilastojasi 'Omat tulokset' -välilehdeltä!"
                  : "Mölkky käyttää sijoitustilastoja. Katso henkilökohtaisia tilastojasi 'Omat tulokset' -välilehdeltä!"
                }
              </p>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">📊</div>
              <p 
                className="text-lg"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                {viewMode === "personal" ? "Pelaa pelejä kerätäksesi tuloksia!" : "Ladataan tulostaulukkoa..."}
              </p>
            </div>
          )}
        </div>


        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mt-6">
            <div className="text-4xl mb-2">⚠️</div>
            <p 
              className="text-red-600 font-medium"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}