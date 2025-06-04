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

interface User {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
}

export default function BeerGame() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [manualTime, setManualTime] = useState("");
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

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/list");
      if (!response.ok) throw new Error("Käyttäjien haku epäonnistui");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Virhe käyttäjien haussa:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchUsers();
    return () => {
      if (timerRef.current !== undefined) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setIsRunning(true);
    setTime(0);
    setShowSubmit(false);
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setTime((Date.now() - startTimeRef.current) / 1000);
    }, 10);
  };

  const stopTimer = () => {
    if (timerRef.current !== undefined) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    setIsRunning(false);
    const time = (Date.now() - startTimeRef.current) / 1000;
    setFinalTime(time);
    setShowSubmit(true);
  };

  const submitScore = async () => {
    if (!selectedUserId) {
      setError("Valitse pelaaja ensin");
      return;
    }

    const timeToSubmit = manualMode ? parseFloat(manualTime) : finalTime;
    
    if (manualMode && (!manualTime || isNaN(timeToSubmit) || timeToSubmit <= 0)) {
      setError("Syötä kelvollinen aika");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/games/beer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: timeToSubmit,
          userId: selectedUserId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ajan tallennus epäonnistui");
      }

      setTime(0);
      setShowSubmit(false);
      setSelectedUserId("");
      setManualTime("");
      setManualMode(false);
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
          {/* User selection */}
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-900 mb-2">
              Valitse juoja:
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">-- Valitse pelaaja --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle between timer and manual entry */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setManualMode(false);
                setShowSubmit(false);
                setTime(0);
                setManualTime("");
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !manualMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Ajastin
            </button>
            <button
              onClick={() => {
                setManualMode(true);
                setShowSubmit(false);
                setTime(0);
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = undefined;
                }
                setIsRunning(false);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                manualMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Syötä aika
            </button>
          </div>

          {!manualMode ? (
            <div className="text-center">
              <div className="text-6xl font-mono mb-4">
                {showSubmit ? finalTime.toFixed(2) : time.toFixed(2)}s
              </div>
              {!isRunning && !showSubmit && (
                <button
                  onClick={startTimer}
                  disabled={isSubmitting || !selectedUserId}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Käynnistä ajanotto
                </button>
              )}
            {isRunning && (
              <button
                onClick={stopTimer}
                className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Pysäytä ajanotto
              </button>
            )}
            {showSubmit && (
              <div className="space-y-4">
                <button
                  onClick={submitScore}
                  disabled={isSubmitting || !selectedUserId}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Tallennetaan..." : "Tallenna tulos"}
                </button>
                <button
                  onClick={() => {
                    setShowSubmit(false);
                    setTime(0);
                    setFinalTime(0);
                  }}
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Peruuta
                </button>
              </div>
            )}
          </div>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <label htmlFor="manual-time" className="block text-sm font-medium text-gray-900 mb-2">
                  Syötä aika (sekunteina):
                </label>
                <input
                  id="manual-time"
                  type="number"
                  step="0.01"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  placeholder="esim. 12.34"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <button
                onClick={submitScore}
                disabled={isSubmitting || !selectedUserId || !manualTime}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Tallennetaan..." : "Tallenna tulos"}
              </button>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="text-sm text-gray-600">
            <p>Ohjeet:</p>
            {!manualMode ? (
              <ol className="list-decimal pl-4 space-y-1">
                <li>Valitse kenen aika otetaan</li>
                <li>Paina &quot;Käynnistä ajanotto&quot; kun pelaaja on valmis</li>
                <li>Pelaaja juo kaljan</li>
                <li>Paina &quot;Pysäytä ajanotto&quot; kun pelaaja on valmis</li>
                <li>Paina &quot;Tallenna tulos&quot; tallentaaksesi ajan</li>
              </ol>
            ) : (
              <ol className="list-decimal pl-4 space-y-1">
                <li>Valitse kenen aika tallennetaan</li>
                <li>Syötä aika sekunteina (esim. 12.34)</li>
                <li>Paina &quot;Tallenna tulos&quot;</li>
              </ol>
            )}
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