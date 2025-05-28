"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Player {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
}

interface Match {
  id: string;
  team1Players: Player[];
  team2Players: Player[];
  winners: Player[];
  status: string;
  team1Name?: string;
  team2Name?: string;
  createdAt: string;
}

export default function BeerPongGame() {
  const [allUsers, setAllUsers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New match state
  const [team1Players, setTeam1Players] = useState<string[]>([]);
  const [team2Players, setTeam2Players] = useState<string[]>([]);
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all users and matches
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, matchesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/games/beerpong"),
        ]);

        if (!usersRes.ok || !matchesRes.ok) {
          throw new Error("Tietojen haku epäonnistui");
        }

        const users = await usersRes.json();
        const matches = await matchesRes.json();

        setAllUsers(users);
        setMatches(matches);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tietojen haku epäonnistui");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/games/beerpong", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team1PlayerIds: team1Players,
          team2PlayerIds: team2Players,
          team1Name: team1Name || undefined,
          team2Name: team2Name || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Pelin luonti epäonnistui");
      }

      const newMatch = await response.json();
      setMatches((prev) => [newMatch, ...prev]);
      
      // Reset form
      setTeam1Players([]);
      setTeam2Players([]);
      setTeam1Name("");
      setTeam2Name("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pelin luonti epäonnistui");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeclareWinner = async (matchId: string, winningTeam: "team1" | "team2") => {
    try {
      const match = matches.find((m) => m.id === matchId);
      if (!match) return;

      const winnerIds = winningTeam === "team1" 
        ? match.team1Players.map((p) => p.id)
        : match.team2Players.map((p) => p.id);

      const response = await fetch(`/api/games/beerpong/${matchId}/winners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ winnerIds }),
      });

      if (!response.ok) {
        throw new Error("Voittajien tallennus epäonnistui");
      }

      const updatedMatch = await response.json();
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? updatedMatch : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voittajien tallennus epäonnistui");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Ladataan...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Create new match form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Uusi peli</h3>
        <form onSubmit={handleCreateMatch} className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Team 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joukkue 1
              </label>
              <input
                type="text"
                placeholder="Joukkueen nimi (valinnainen)"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <select
                multiple
                value={team1Players}
                onChange={(e) => setTeam1Players(
                  Array.from(e.target.selectedOptions, option => option.value)
                )}
                className="w-full p-2 border rounded h-32"
              >
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Team 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joukkue 2
              </label>
              <input
                type="text"
                placeholder="Joukkueen nimi (valinnainen)"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <select
                multiple
                value={team2Players}
                onChange={(e) => setTeam2Players(
                  Array.from(e.target.selectedOptions, option => option.value)
                )}
                className="w-full p-2 border rounded h-32"
              >
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isCreating || !team1Players.length || !team2Players.length}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? "Luodaan peliä..." : "Luo peli"}
          </button>
        </form>
      </div>

      {/* Ongoing matches */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Käynnissä olevat pelit</h3>
        {matches
          .filter((match) => match.status === "ongoing")
          .map((match) => (
            <div key={match.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <h4 className="font-medium">
                    {match.team1Name || "Joukkue 1"} vs {match.team2Name || "Joukkue 2"}
                  </h4>
                  <div className="text-sm text-gray-500">
                    {new Date(match.createdAt).toLocaleTimeString("fi-FI")}
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleDeclareWinner(match.id, "team1")}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    {match.team1Name || "Joukkue 1"} voitti
                  </button>
                  <button
                    onClick={() => handleDeclareWinner(match.id, "team2")}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    {match.team2Name || "Joukkue 2"} voitti
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Joukkue 1:</div>
                  <div className="flex gap-2">
                    {match.team1Players.map((player) => (
                      <div key={player.id} className="flex items-center">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden mr-1">
                          <Image
                            src={player.photoUrl}
                            alt={player.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm">{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Joukkue 2:</div>
                  <div className="flex gap-2">
                    {match.team2Players.map((player) => (
                      <div key={player.id} className="flex items-center">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden mr-1">
                          <Image
                            src={player.photoUrl}
                            alt={player.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm">{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}