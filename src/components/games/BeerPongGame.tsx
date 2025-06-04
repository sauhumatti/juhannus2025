import { FC, useState, useEffect } from "react";
import { User } from "@/types/user";
import Image from "next/image";

interface Match {
  id: string;
  status: 'ongoing' | 'completed';
  team1Players: User[];
  team2Players: User[];
  winners: User[];
  team1Name?: string;
  team2Name?: string;
  createdAt: string;
}

const BeerPongGame: FC = () => {
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
  const [team1Players, setTeam1Players] = useState<User[]>([]);
  const [team2Players, setTeam2Players] = useState<User[]>([]);
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSettingWinner, setIsSettingWinner] = useState(false);

  const getAvailablePlayers = (currentTeam: User[], otherTeam: User[]) => {
    // Ensure we have arrays to work with
    const safeCurrentTeam = currentTeam || [];
    const safeOtherTeam = otherTeam || [];
    
    // Filter out players that are already selected in either team
    return availablePlayers.filter(player => 
      !safeCurrentTeam.some(p => p?.id === player.id) && 
      !safeOtherTeam.some(p => p?.id === player.id)
    );
  };

  const handleCreateMatch = async () => {
    if (team1Players.length === 0 || team2Players.length === 0) {
      alert("Molemmissa joukkueissa tulee olla pelaajia");
      return;
    }
    
    setIsCreating(true);
    try {
      const response = await fetch("/api/games/beerpong/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team1PlayerIds: team1Players.map(p => p.id),
          team2PlayerIds: team2Players.map(p => p.id),
          team1Name: team1Name || undefined,
          team2Name: team2Name || undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create match");
      }

      // Refresh matches
      fetchMatches();

      // Reset form
      setTeam1Players([]);
      setTeam2Players([]);
      setTeam1Name("");
      setTeam2Name("");
    } catch (error) {
      console.error("Error creating match:", error);
      alert("Virhe pelin luonnissa");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetWinner = async (matchId: string, winnerTeam: 'team1' | 'team2') => {
    setIsSettingWinner(true);
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      const winners = winnerTeam === 'team1' ? match.team1Players : match.team2Players;
      const response = await fetch(`/api/games/beerpong/matches/${matchId}/winners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          winnerIds: winners.map(p => p.id)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set winner");
      }

      // Refresh matches
      fetchMatches();
    } catch (error) {
      console.error("Error setting winner:", error);
      alert("Virhe voittajan asettamisessa");
    } finally {
      setIsSettingWinner(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/games/beerpong/matches");
      if (!response.ok) throw new Error("Failed to fetch matches");
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error("Error fetching matches:", error);
      alert("Virhe pelien haussa");
    }
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Failed to fetch players");
        const data = await response.json();
        setAvailablePlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
        alert("Virhe pelaajien haussa");
      }
    };
    
    fetchPlayers();
    fetchMatches();
  }, []);

  return (
    <div className="space-y-6">
      {/* Create new game */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Uusi peli</h2>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Pelin luonti:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
            <li>Valitse 1-2 pelaajaa kumpaankin joukkueeseen</li>
            <li>Halutessasi voit nimetä joukkueet</li>
          </ol>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Joukkue 1 nimi (valinnainen)
                </label>
                <input
                  type="text"
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  className="w-full border rounded-lg p-2 text-gray-900 placeholder:text-gray-500"
                  placeholder="Anna joukkueen nimi"
                />
              </div>
              
              {/* Team 1 Player 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Pelaaja 1
                </label>
                <select
                  value={team1Players[0]?.id || ''}
                  onChange={(e) => {
                    const player = availablePlayers.find(p => p.id === e.target.value);
                    if (player) {
                      setTeam1Players([player, ...team1Players.slice(1)]);
                    } else {
                      setTeam1Players(team1Players.slice(1));
                    }
                  }}
                  className="w-full border rounded-lg p-2 text-gray-900"
                >
                  <option value="">Valitse pelaaja</option>
                  {getAvailablePlayers(team1Players.slice(1), team2Players).map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>

              {/* Team 1 Player 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Pelaaja 2 (valinnainen)
                </label>
                <select
                  value={team1Players[1]?.id || ''}
                  onChange={(e) => {
                    const player = availablePlayers.find(p => p.id === e.target.value);
                    if (player) {
                      setTeam1Players([...team1Players.slice(0, 1), player]);
                    } else {
                      setTeam1Players(team1Players.slice(0, 1));
                    }
                  }}
                  className="w-full border rounded-lg p-2 text-gray-900"
                  disabled={!team1Players[0]} // Disable if first player not selected
                >
                  <option value="">Valitse pelaaja</option>
                  {team1Players[0] && getAvailablePlayers([team1Players[0]], team2Players).map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Joukkue 2 nimi (valinnainen)
                </label>
                <input
                  type="text"
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  className="w-full border rounded-lg p-2 text-gray-900 placeholder:text-gray-500"
                  placeholder="Anna joukkueen nimi"
                />
              </div>

              {/* Team 2 Player 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Pelaaja 1
                </label>
                <select
                  value={team2Players[0]?.id || ''}
                  onChange={(e) => {
                    const player = availablePlayers.find(p => p.id === e.target.value);
                    if (player) {
                      setTeam2Players([player, ...team2Players.slice(1)]);
                    } else {
                      setTeam2Players(team2Players.slice(1));
                    }
                  }}
                  className="w-full border rounded-lg p-2 text-gray-900"
                >
                  <option value="">Valitse pelaaja</option>
                  {getAvailablePlayers(team2Players.slice(1), team1Players).map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>

              {/* Team 2 Player 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Pelaaja 2 (valinnainen)
                </label>
                <select
                  value={team2Players[1]?.id || ''}
                  onChange={(e) => {
                    const player = availablePlayers.find(p => p.id === e.target.value);
                    if (player) {
                      setTeam2Players([...team2Players.slice(0, 1), player]);
                    } else {
                      setTeam2Players(team2Players.slice(0, 1));
                    }
                  }}
                  className="w-full border rounded-lg p-2 text-gray-900"
                  disabled={!team2Players[0]} // Disable if first player not selected
                >
                  <option value="">Valitse pelaaja</option>
                  {team2Players[0] && getAvailablePlayers([team2Players[0]], team1Players).map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateMatch}
            disabled={isCreating || !team1Players[0] || !team2Players[0]}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? "Luodaan..." : "Luo peli"}
          </button>
        </div>
      </div>

      {/* Active games */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Käynnissä olevat pelit</h2>
        <div className="space-y-4">
          {matches.filter(match => match.status === 'ongoing').map(match => (
            <div key={match.id} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="flex-1 mb-2 sm:mb-0">
                  <div className="font-medium">
                    {match.team1Name || `Joukkue ${match.team1Players.map(p => p.name).join(' & ')}`}
                    <span className="mx-2 text-gray-400">vs</span>
                    {match.team2Name || `Joukkue ${match.team2Players.map(p => p.name).join(' & ')}`}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Luotu: {new Date(match.createdAt).toLocaleString('fi-FI')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetWinner(match.id, 'team1')}
                    disabled={isSettingWinner}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Joukkue 1 voitti
                  </button>
                  <button
                    onClick={() => handleSetWinner(match.id, 'team2')}
                    disabled={isSettingWinner}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                  >
                    Joukkue 2 voitti
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {match.team1Players.map(player => (
                    <div key={player.id} className="flex items-center mb-1">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
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
                <div>
                  {match.team2Players.map(player => (
                    <div key={player.id} className="flex items-center mb-1">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
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
          ))}
          {matches.filter(match => match.status === 'ongoing').length === 0 && (
            <p className="text-gray-500 text-center py-4">Ei käynnissä olevia pelejä</p>
          )}
        </div>
      </div>

      {/* Completed games */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Päättyneet pelit</h2>
        <div className="space-y-4">
          {matches.filter(match => match.status === 'completed').map(match => (
            <div key={match.id} className="border rounded-lg p-4">
              <div className="mb-4">
                <div className="font-medium">
                  {match.team1Name || `Joukkue ${match.team1Players.map(p => p.name).join(' & ')}`}
                  <span className="mx-2 text-gray-400">vs</span>
                  {match.team2Name || `Joukkue ${match.team2Players.map(p => p.name).join(' & ')}`}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Pelattu: {new Date(match.createdAt).toLocaleString('fi-FI')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={match.winners.some(w => match.team1Players.find(p => p.id === w.id)) ? "text-blue-800" : "text-gray-500"}>
                  {match.team1Players.map(player => (
                    <div key={player.id} className="flex items-center mb-1">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
                        <Image
                          src={player.photoUrl}
                          alt={player.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm">{player.name}</span>
                      {match.winners.find(w => w.id === player.id) && (
                        <span className="ml-2 text-sm">👑</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className={match.winners.some(w => match.team2Players.find(p => p.id === w.id)) ? "text-purple-800" : "text-gray-500"}>
                  {match.team2Players.map(player => (
                    <div key={player.id} className="flex items-center mb-1">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
                        <Image
                          src={player.photoUrl}
                          alt={player.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm">{player.name}</span>
                      {match.winners.find(w => w.id === player.id) && (
                        <span className="ml-2 text-sm">👑</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {matches.filter(match => match.status === 'completed').length === 0 && (
            <p className="text-gray-500 text-center py-4">Ei päättyneitä pelejä</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeerPongGame;