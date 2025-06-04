"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Leaderboard from "@/components/Leaderboard";

interface Stats {
  answersGiven: number;
  timesSelected: number;
  uniqueCardsCount: number;
  ownCardProgress: number;
}

interface GameScore {
  id: string;
  score?: number;
  time?: number;
  createdAt: string;
}

interface Records {
  dartScores: GameScore[];
  puttingScores: GameScore[];
  beerScores: GameScore[];
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

interface IcebreakerLeaderboardEntry {
  userId: string;
  name: string;
  photoUrl: string;
  questionsAnswered: number;
  totalQuestions: number;
  completionPercentage: number;
}

interface SelectedAsAnswer {
  cardOwner: string;
  cardTitle: string;
  questionNumber: number;
  questionText: string;
}

const tabs = [
  { id: "darts", name: "Tikanheitto" },
  { id: "putting", name: "Puttaus" },
  { id: "beer", name: "Kaljakellotus" },
  { id: "icebreaker", name: "Tutustumispeli" },
];

export default function Records() {
  const [activeTab, setActiveTab] = useState("darts");
  const [viewMode, setViewMode] = useState<"personal" | "leaderboard">("personal");
  const [records, setRecords] = useState<Records | null>(null);
  const [leaderboards, setLeaderboards] = useState<{ [key: string]: LeaderboardEntry[] | IcebreakerLeaderboardEntry[] }>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedAsAnswers, setSelectedAsAnswers] = useState<SelectedAsAnswer[]>([]);
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
          if (activeTab === "icebreaker") {
            const statsRes = await fetch(`/api/users/stats?userId=${user.id}`);
            if (!statsRes.ok) throw new Error("Failed to fetch stats");
            const statsData = await statsRes.json();
            setStats(statsData);
            
            // Fetch questions where user was selected as answer
            const selectedRes = await fetch(`/api/icebreaker/selected-as-answer?userId=${user.id}`);
            if (selectedRes.ok) {
              const selectedData = await selectedRes.json();
              setSelectedAsAnswers(selectedData);
            }
            
            setRecords(null);
          } else {
            setStats(null);
            setSelectedAsAnswers([]);
            const scoresRes = await fetch(`/api/users/records?userId=${user.id}`);
            if (!scoresRes.ok) throw new Error("Failed to fetch records");
            const scoresData = await scoresRes.json();
            setRecords(scoresData);
          }
        } else {
          // Fetch leaderboards
          setStats(null);
          setRecords(null);
          setSelectedAsAnswers([]);
          
          if (activeTab === "icebreaker") {
            const res = await fetch("/api/icebreaker/leaderboard");
            if (!res.ok) throw new Error("Failed to fetch leaderboard");
            const data = await res.json();
            setLeaderboards({ icebreaker: data });
          } else {
            const gameMap: { [key: string]: string } = {
              darts: "darts",
              putting: "putting",
              beer: "beer"
            };
            const res = await fetch(`/api/games/${gameMap[activeTab]}`);
            if (!res.ok) throw new Error("Failed to fetch leaderboard");
            const data = await res.json();
            // The API returns the array directly, not as data.leaderboard
            setLeaderboards({ [activeTab]: data });
          }
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4 records-page">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8 border-2 border-green-200">
          <h1 className="text-5xl font-bold text-center mb-2 dancing-font">
            {viewMode === "personal" ? "Omat tulokset" : "Tulostaulukko"}
          </h1>
          <div className="w-32 h-1 bg-green-400 mx-auto mb-6"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center mb-6">
            
            {/* View mode toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewMode("personal")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "personal" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Omat tulokset
              </button>
              <button
                onClick={() => setViewMode("leaderboard")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "leaderboard" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Tulostaulukko
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 -mx-6 px-6 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="mt-6">
            {/* Icebreaker Stats */}
            {activeTab === "icebreaker" && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-600 font-medium">Oma kortti</p>
                    <p className="text-2xl font-semibold text-blue-900">{stats.ownCardProgress}/20</p>
                    <p className="text-xs text-blue-500 mt-1">vastauksia löydetty</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600 font-medium">Sinut valittu</p>
                    <p className="text-2xl font-semibold text-purple-900">{stats.timesSelected}</p>
                    <p className="text-xs text-purple-500 mt-1">kertaa vastaukseksi</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Muista: tavoitteena on löytää henkilö jokaiseen korttisi väittämään. 
                    Samalla autat muita pelaajia täyttämään heidän korttinsa!
                  </p>
                </div>

                {/* Questions where user was selected as answer */}
                {selectedAsAnswers.length > 0 && viewMode === "personal" && (
                  <div className="bg-green-50 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Sinut on valittu vastaukseksi</h3>
                    <p className="text-green-900 mb-4 text-sm font-medium">
                      Nämä ovat kysymykset, joihin muut pelaajat ovat valinneet sinut vastaukseksi:
                    </p>
                    
                    <div className="space-y-3">
                      {selectedAsAnswers.map((answer) => (
                        <div
                          key={`${answer.cardOwner}-${answer.questionNumber}`}
                          className="bg-white p-4 rounded-lg border border-green-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 mb-1 font-medium">
                                <strong className="text-gray-900">{answer.cardOwner}</strong> - {answer.cardTitle}
                              </p>
                              <p className="text-gray-900 font-semibold">
                                {answer.questionNumber}. {answer.questionText}
                              </p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900">
                                Sinä
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Darts */}
            {activeTab === "darts" && records?.dartScores && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {(() => {
                    const stats = getStats(records.dartScores);
                    return stats ? (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Paras tulos</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.best}/50</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Keskiarvo</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.average}/50</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Pelatut pelit</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pisteet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Päivämäärä</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.dartScores.map((score) => (
                      <tr key={score.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{score.score}/50</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(score.createdAt).toLocaleDateString('fi-FI')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Putting */}
            {activeTab === "putting" && records?.puttingScores && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {(() => {
                    const stats = getStats(records.puttingScores);
                    return stats ? (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Paras tulos</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.best}/10</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Keskiarvo</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.average}/10</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Pelatut pelit</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pisteet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Päivämäärä</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.puttingScores.map((score) => (
                      <tr key={score.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{score.score}/10</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(score.createdAt).toLocaleDateString('fi-FI')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Beer game */}
            {activeTab === "beer" && records?.beerScores && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {(() => {
                    const stats = getStats(records.beerScores);
                    return stats ? (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Paras aika</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.best.toFixed(2)}s</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Keskiarvo</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.average.toFixed(2)}s</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Pelatut pelit</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aika</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Päivämäärä</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.beerScores.map((score) => (
                      <tr key={score.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{score.time?.toFixed(2)}s</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(score.createdAt).toLocaleDateString('fi-FI')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Leaderboards */}
            {viewMode === "leaderboard" && (
              <>
                {/* Darts Leaderboard */}
                {activeTab === "darts" && leaderboards.darts && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Pelaajat</h3>
                    {leaderboards.darts.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Ei tuloksia vielä</p>
                    ) : (
                      <Leaderboard scores={(leaderboards.darts as LeaderboardEntry[]).slice(0, 10)} type="points" maxScore={50} />
                    )}
                  </div>
                )}

                {/* Putting Leaderboard */}
                {activeTab === "putting" && leaderboards.putting && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Pelaajat</h3>
                    {leaderboards.putting.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Ei tuloksia vielä</p>
                    ) : (
                      <Leaderboard scores={(leaderboards.putting as LeaderboardEntry[]).slice(0, 10)} type="points" maxScore={10} />
                    )}
                  </div>
                )}

                {/* Beer Leaderboard */}
                {activeTab === "beer" && leaderboards.beer && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Pelaajat</h3>
                    {leaderboards.beer.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Ei tuloksia vielä</p>
                    ) : (
                      <Leaderboard scores={(leaderboards.beer as LeaderboardEntry[]).slice(0, 10)} type="time" />
                    )}
                  </div>
                )}

                {/* Icebreaker Leaderboard */}
                {activeTab === "icebreaker" && leaderboards.icebreaker && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Pelaajat</h3>
                    {leaderboards.icebreaker.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Ei tuloksia vielä</p>
                    ) : (
                      <div className="space-y-2">
                        {(leaderboards.icebreaker as IcebreakerLeaderboardEntry[]).slice(0, 10).map((entry, index) => (
                          <div
                            key={entry.userId}
                            className={`flex items-center justify-between p-4 rounded-lg ${
                              index === 0 ? "bg-yellow-50" : 
                              index === 1 ? "bg-gray-100" :
                              index === 2 ? "bg-orange-50" : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <span className={`text-lg font-bold ${
                                index === 0 ? "text-yellow-600" : 
                                index === 1 ? "text-gray-800" :
                                index === 2 ? "text-orange-600" : "text-gray-700"
                              }`}>
                                #{index + 1}
                              </span>
                              <span className="font-medium text-gray-900">{entry.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold text-gray-900">{entry.questionsAnswered}/{entry.totalQuestions}</span>
                              <span className="text-sm text-gray-700 block">{entry.completionPercentage}% valmis</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="text-red-500 text-center py-4">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}