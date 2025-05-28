"use client";

import { useState, useEffect, useRef } from "react";
import Leaderboard from "@/components/Leaderboard";

interface Score {
  id: string;
  time: number;
  createdAt: string;
  user: {
    name: string;
    username: string;
    photoUrl: string;
  };
}

export default function BeerGame() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const timerRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/games/beer");
      if (!response.ok) throw new Error("Tulosten haku epäonnistui");
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Virhe tulosten haussa:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    return () => {
      if (timerRef.current !== undefined) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setIsRunning(true);
    setTime(0);
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setTime((Date.now() - startTimeRef.current) / 1000);
    }, 10);
  };

  const stopTimer = async () => {
    if (timerRef.current !== undefined) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    setIsRunning(false);
    const finalTime = (Date.now() - startTimeRef.current) / 1000;
    await submitScore(finalTime);
  };

  const submitScore = async (finalTime: number) => {
    setIsSubmitting(true);
    setError("");

    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (!user.id) throw new Error("Kirjaudu sisään tallentaaksesi tuloksen");

      const response = await fetch("/api/games/beer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: finalTime,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ajan tallennus epäonnistui");
      }

      setTime(0);
      fetchLeaderboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ajan tallennus epäonnistui");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Kaljakellotus
        </h2>
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-mono mb-4">
              {time.toFixed(2)}s
            </div>
            {!isRunning ? (
              <button
                onClick={startTimer}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Käynnistä ajanotto
              </button>
            ) : (
              <button
                onClick={stopTimer}
                className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Pysäytä ajanotto
              </button>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="text-sm text-gray-600">
            <p>Ohjeet:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Paina &quot;Käynnistä ajanotto&quot; kun olet valmis</li>
              <li>Juo kaljas</li>
              <li>Paina &quot;Pysäytä ajanotto&quot; kun olet valmis</li>
              <li>Aikasi tallennetaan automaattisesti</li>
            </ol>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Tulostaulu</h3>
        <Leaderboard scores={leaderboard} type="time" />
      </div>
    </div>
  );
}