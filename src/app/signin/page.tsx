"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kirjautuminen epäonnistui");
      }

      const user = await response.json();
      sessionStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirjautuminen epäonnistui");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#F0FFF0' }}>
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
        {/* Gentle forest overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-green-800/15 to-green-700/20" />
      </div>

      {/* Floating forest elements */}
      <div className="fixed inset-0 z-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="floating-leaf"
            style={{
              position: 'absolute',
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              fontSize: '1.5rem',
              animation: `gentleFloat ${8 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
              opacity: 0.6
            }}
          >
            🍃
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-200 p-8 space-y-8">
          <div className="text-center">
            <div className="mb-4">
              <span 
                className="text-4xl font-bold"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  background: 'linear-gradient(135deg, #228B22, #32CD32)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                🌲 Juhannukseen Takaisin
              </span>
            </div>
            <p 
              className="text-lg"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Anna käyttäjänimesi jatkaaksesi juhliin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium mb-2"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#228B22'
                }}
              >
                🦋 Käyttäjänimi
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all outline-none"
                placeholder="Syötä käyttäjänimesi"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#228B22'
                }}
              >
                🍄 Salasana
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all outline-none"
                placeholder="Syötä salasanasi"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              />
            </div>

            {error && (
              <div 
                className="text-center p-3 bg-red-50 border border-red-200 rounded-lg"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#DC2626'
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-3 px-4 text-white rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                backgroundColor: '#228B22'
              }}
            >
              {isLoading ? "🌿 Astutaan juhannukseen..." : "🍄 Astu Juhannukseen"}
            </button>

            <div 
              className="text-center text-sm"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Eikö sinulla ole pääsyä juhannukseen?{" "}
              <Link 
                href="/signup" 
                className="font-medium hover:underline"
                style={{ color: '#228B22' }}
              >
                Luo polku
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -10px) rotate(5deg); }
          50% { transform: translate(-5px, -15px) rotate(-3deg); }
          75% { transform: translate(-10px, -5px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}