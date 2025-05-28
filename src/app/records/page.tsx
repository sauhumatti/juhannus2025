"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

const tabs = [
  { id: "darts", name: "Tikanheitto" },
  { id: "putting", name: "Puttaus" },
  { id: "beer", name: "Kaljakellotus" },
  { id: "icebreaker", name: "Tutustumispeli" },
];

export default function Records() {
  const [activeTab, setActiveTab] = useState("darts");
  const [records, setRecords] = useState<Records | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
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

        if (activeTab === "icebreaker") {
          const statsRes = await fetch(`/api/users/stats?userId=${user.id}`);
          if (!statsRes.ok) throw new Error("Failed to fetch stats");
          const statsData = await statsRes.json();
          setStats(statsData);
          setRecords(null);
        } else {
          setStats(null);
          const scoresRes = await fetch(`/api/users/records?userId=${user.id}`);
          if (!scoresRes.ok) throw new Error("Failed to fetch records");
          const scoresData = await scoresRes.json();
          setRecords(scoresData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading game data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, activeTab]);

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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Pelituloksesi</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-600 font-medium">Oma kortti</p>
                    <p className="text-2xl font-semibold text-blue-900">{stats.ownCardProgress}/20</p>
                    <p className="text-xs text-blue-500 mt-1">löydettyä henkilöä</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-green-600 font-medium">Vastauksia annettu</p>
                    <p className="text-2xl font-semibold text-green-900">{stats.answersGiven}</p>
                    <p className="text-xs text-green-500 mt-1">muiden kortteihin</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600 font-medium">Sinut löydetty</p>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{score.score}/50</td>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{score.score}/10</td>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{score.time?.toFixed(2)}s</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(score.createdAt).toLocaleDateString('fi-FI')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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