"use client";

import { useState, useEffect } from "react";
import Leaderboard from "@/components/Leaderboard";

interface Score {
  id: string;
  score: number;
  createdAt: string;
  user: {
    name: string;
    username: string;
    photoUrl: string;
  };
}

export default function DartGame() {
  const [score, setScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/games/darts");
      if (!response.ok) throw new Error("Tulosten haku epäonnistui");
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Virhe tulosten haussa:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const scoreNum = parseInt(score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 50) {
        throw new Error("Pisteiden tulee olla väliltä 0-50");
      }

      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (!user.id) throw new Error("Kirjaudu sisään tallentaaksesi tuloksen");

      const response = await fetch("/api/games/darts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: scoreNum,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Pisteiden tallennus epäonnistui");
      }

      setScore("");
      fetchLeaderboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pisteiden tallennus epäonnistui");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Tikanheitto (5 tikkaa, max 50 pistettä)
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700">
              Pisteesi
            </label>
            <input
              type="number"
              id="score"
              min="0"
              max="50"
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
              placeholder="Syötä pisteet (0-50)"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !score}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Tallennetaan..." : "Tallenna pisteet"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Tulostaulu</h3>
        <Leaderboard scores={leaderboard} type="points" maxScore={50} />
      </div>
    </div>
  );
}