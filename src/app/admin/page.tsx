"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface GameState {
  isIcebreakerEnabled: boolean;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  score: number;
  gameType: string;
  userName: string;
}

interface IcebreakerAnswer {
  id: string;
  cardId: number;
  cardOwner: string;
  questionNumber: number;
  giver: string;
  receiver: string;
  createdAt: Date;
}

interface User {
  id: string;
  username: string;
  name: string;
  photoUrl: string;
  dartScores: { score: number }[];
  puttingScores: { score: number }[];
  beerScores: { time: number }[];
  beerPongStats: {
    wins: number;
    losses: number;
  } | null;
  icebreaker: {
    hasCard: boolean;
    answersCount: number;
    totalQuestions: number;
  };
}

interface BeerPongMatch {
  id: string;
  status: string;
  team1Players: { id: string; name: string; }[];
  team2Players: { id: string; name: string; }[];
  winners: { id: string; name: string; }[];
  team1Name?: string;
  team2Name?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    isIcebreakerEnabled: false
  });
  const [icebreakerLoading, setIcebreakerLoading] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [beerPongMatches, setBeerPongMatches] = useState<BeerPongMatch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [icebreakerAnswers, setIcebreakerAnswers] = useState<IcebreakerAnswer[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      router.push("/signin");
      return;
    }

    const user = JSON.parse(storedUser);
    // TODO: Replace with actual admin check
    if (user.username !== "admin") {
      router.push("/menu");
      return;
    }

    setIsAdmin(true);
    fetchGameState();
    fetchLeaderboard();
    fetchBeerPongMatches();
    fetchUsers();
    fetchIcebreakerAnswers();
  }, [router]);

  const fetchGameState = async () => {
    try {
      const response = await fetch("/api/admin/game-state");
      if (!response.ok) throw new Error("Failed to fetch game state");
      const data = await response.json();
      setGameState(data);
    } catch (err) {
      console.error("Error fetching game state:", err);
      setError("Failed to load game state");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/admin/leaderboard");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      setLeaderboardEntries(data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard");
    }
  };

  const toggleIcebreaker = async () => {
    if (icebreakerLoading) return;
    
    setIcebreakerLoading(true);
    setError("");
    
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      
      const response = await fetch("/api/admin/game-state", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-session-data": JSON.stringify(user)
        },
        body: JSON.stringify({
          isIcebreakerEnabled: !gameState.isIcebreakerEnabled
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Virhe pelin tilan päivittämisessä");
      }
      
      const data = await response.json();
      setGameState(data);
    } catch (err) {
      console.error("Error toggling icebreaker:", err);
      setError(err instanceof Error ? err.message : "Virhe pelin tilan päivittämisessä");
    } finally {
      setIcebreakerLoading(false);
    }
  };

  const updateScore = async (entryId: string, newScore: number, gameType: string) => {
    try {
      const response = await fetch(`/api/admin/leaderboard/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: newScore,
          gameType
        })
      });

      if (!response.ok) throw new Error("Failed to update score");
      fetchLeaderboard();
    } catch (err) {
      console.error("Error updating score:", err);
      setError("Failed to update score");
    }
  };

  const fetchIcebreakerAnswers = async () => {
    try {
      const response = await fetch("/api/admin/icebreaker/answers");
      if (!response.ok) throw new Error("Failed to fetch icebreaker answers");
      const data = await response.json();
      setIcebreakerAnswers(data);
    } catch (err) {
      console.error("Error fetching icebreaker answers:", err);
      setError("Failed to load icebreaker answers");
    }
  };

  const deleteIcebreakerAnswer = async (answerId: string) => {
    if (!confirm("Are you sure you want to delete this answer?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/icebreaker/answers/${answerId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete answer");
      fetchIcebreakerAnswers();
    } catch (err) {
      console.error("Error deleting icebreaker answer:", err);
      setError("Failed to delete answer");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    }
  };

  const deleteUser = async (userId: string, username: string) => {
    if (username === "admin") {
      alert("Cannot delete admin user");
      return;
    }

    if (!confirm(`Are you sure you want to delete user ${username}? This will remove all their scores and game data.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete user");
      
      // Refresh all data as user deletion affects multiple sections
      fetchUsers();
      fetchLeaderboard();
      fetchBeerPongMatches();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user");
    }
  };

  const fetchBeerPongMatches = async () => {
    try {
      const response = await fetch("/api/admin/beerpong");
      if (!response.ok) throw new Error("Failed to fetch beer pong matches");
      const data = await response.json();
      setBeerPongMatches(data);
    } catch (err) {
      console.error("Error fetching beer pong matches:", err);
      setError("Failed to load beer pong matches");
    }
  };

  const updateMatchStatus = async (matchId: string, status: string, winners?: string[]) => {
    try {
      const response = await fetch(`/api/admin/beerpong/${matchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, winners })
      });

      if (!response.ok) throw new Error("Failed to update match");
      fetchBeerPongMatches();
    } catch (err) {
      console.error("Error updating match status:", err);
      setError("Failed to update match");
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match? This will affect player statistics.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/beerpong/${matchId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete match");
      fetchBeerPongMatches();
    } catch (err) {
      console.error("Error deleting match:", err);
      setError("Failed to delete match");
    }
  };

  const deleteScore = async (entryId: string, gameType: string) => {
    if (!confirm("Are you sure you want to delete this score?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/leaderboard/${entryId}?gameType=${gameType}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete score");
      fetchLeaderboard();
    } catch (err) {
      console.error("Error deleting score:", err);
      setError("Failed to delete score");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 admin-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Pelin hallinta</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-900">Tutustumispeli:</span>
            <button
              onClick={toggleIcebreaker}
              disabled={icebreakerLoading}
              className={`px-4 py-2 rounded-lg ${
                gameState.isIcebreakerEnabled
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {icebreakerLoading 
                ? "Ladataan..." 
                : gameState.isIcebreakerEnabled 
                  ? "Sammuta" 
                  : "Käynnistä"
              }
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Leaderboard Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-gray-900 font-semibold">Player</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Game</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Score</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardEntries.map((entry) => (
                  <tr key={entry.id} className="border-b">
                    <td className="p-2 text-gray-900">{entry.userName}</td>
                    <td className="p-2 text-gray-900">{entry.gameType}</td>
                    <td className="p-2 text-gray-900">
                      {entry.gameType === 'Beer'
                        ? `${entry.score}s`
                        : entry.score}
                    </td>
                    <td className="p-2 flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1 text-gray-900"
                        defaultValue={entry.score}
                        step={entry.gameType === 'Beer' ? "0.01" : "1"}
                        onBlur={(e) => {
                          const newScore = parseFloat(e.target.value);
                          if (!isNaN(newScore) && newScore !== entry.score) {
                            updateScore(entry.id, newScore, entry.gameType);
                          }
                        }}
                      />
                      <button
                        onClick={() => deleteScore(entry.id, entry.gameType)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete score"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Beer Pong Matches</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-gray-900 font-semibold">Teams</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Status</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Winners</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {beerPongMatches.map((match) => (
                  <tr key={match.id} className="border-b">
                    <td className="p-2 text-gray-900">
                      <div>
                        {match.team1Name || match.team1Players.map(p => p.name).join(", ")}
                        <span className="mx-2">vs</span>
                        {match.team2Name || match.team2Players.map(p => p.name).join(", ")}
                      </div>
                    </td>
                    <td className="p-2">
                      <select
                        value={match.status}
                        onChange={(e) => updateMatchStatus(match.id, e.target.value)}
                        className="border rounded px-2 py-1 text-gray-900"
                      >
                        <option value="ongoing" className="text-gray-900">Ongoing</option>
                        <option value="completed" className="text-gray-900">Completed</option>
                      </select>
                    </td>
                    <td className="p-2">
                      {match.status === "completed" && (
                        <select
                          value={match.winners.map(w => w.id).join(",")}
                          onChange={(e) => {
                            const winners = e.target.value ? e.target.value.split(",") : [];
                            updateMatchStatus(match.id, "completed", winners);
                          }}
                          className="border rounded px-2 py-1 text-gray-900"
                        >
                          <option value="" className="text-gray-900">Select Winners</option>
                          <option value={match.team1Players.map(p => p.id).join(",")} className="text-gray-900">
                            Team 1
                          </option>
                          <option value={match.team2Players.map(p => p.id).join(",")} className="text-gray-900">
                            Team 2
                          </option>
                        </select>
                      )}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => deleteMatch(match.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete match"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-gray-900 font-semibold">User</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Username</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Game Stats</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Beer Pong</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Tutustumispeli</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2 flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={user.photoUrl}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-gray-900 font-medium">{user.name}</span>
                    </td>
                    <td className="p-2 text-gray-900">{user.username}</td>
                    <td className="p-2">
                      <div className="text-sm text-gray-900">
                        Darts: {user.dartScores.length > 0 ?
                          `Best: ${Math.max(...user.dartScores.map(s => s.score))}` :
                          'No scores'}
                      </div>
                      <div className="text-sm text-gray-900">
                        Putting: {user.puttingScores.length > 0 ?
                          `Best: ${Math.max(...user.puttingScores.map(s => s.score))}` :
                          'No scores'}
                      </div>
                      <div className="text-sm text-gray-900">
                        Beer: {user.beerScores.length > 0 ?
                          `Best: ${Math.min(...user.beerScores.map(s => s.time))}s` :
                          'No scores'}
                      </div>
                    </td>
                    <td className="p-2 text-gray-900">
                      {user.beerPongStats ?
                        `${user.beerPongStats.wins}W/${user.beerPongStats.losses}L` :
                        'No games'}
                    </td>
                    <td className="p-2">
                      {user.icebreaker.hasCard ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">{user.icebreaker.answersCount} / {user.icebreaker.totalQuestions}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                user.icebreaker.answersCount === user.icebreaker.totalQuestions
                                  ? "bg-green-600"
                                  : "bg-blue-600"
                              }`}
                              style={{ width: `${(user.icebreaker.answersCount / user.icebreaker.totalQuestions) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-700">No card assigned</span>
                      )}
                    </td>
                    <td className="p-2">
                      {user.username !== "admin" && (
                        <button
                          onClick={() => deleteUser(user.id, user.username)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete user"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Tutustumispeli Answers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-gray-900 font-semibold">Card Owner</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Question</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Given By</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Given To</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Time</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {icebreakerAnswers.map((answer) => (
                  <tr key={answer.id} className="border-b">
                    <td className="p-2 text-gray-900">{answer.cardOwner}</td>
                    <td className="p-2 text-gray-900">{answer.questionNumber}</td>
                    <td className="p-2 text-gray-900">{answer.giver}</td>
                    <td className="p-2 text-gray-900">{answer.receiver}</td>
                    <td className="p-2 text-gray-900">
                      {new Date(answer.createdAt).toLocaleString('fi-FI')}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => deleteIcebreakerAnswer(answer.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete answer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}