"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import WeatherEffects from "@/components/WeatherEffects";

interface User {
  id: string;
  username: string;
  name: string;
  photoUrl: string;
}

interface PhotoMoment {
  id: string;
  photoUrl: string;
  caption: string | null;
  createdAt: string;
  user: User;
}

interface GameStats {
  totalGames: number;
  wins: number;
  recentActivity: string;
}

interface WeatherData {
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  location: {
    name: string;
    country: string;
  };
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<PhotoMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStats, setGameStats] = useState<GameStats>({ totalGames: 0, wins: 0, recentActivity: "" });
  const [showPhotos] = useState(3);
  const [bonfireLit, setBonfireLit] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  const fetchRecentPhotos = useCallback(async () => {
    try {
      const response = await fetch("/api/photos?includeHighscores=true");
      if (response.ok) {
        const photos = await response.json();
        setRecentPhotos(photos.slice(0, showPhotos));
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  }, [showPhotos]);

  const fetchWeather = useCallback(async () => {
    try {
      const response = await fetch("/api/weather");
      if (response.ok) {
        const weatherData = await response.json();
        setWeather(weatherData);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        router.push("/signin");
        return;
      }
      
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Set default game stats immediately
        setGameStats({
          totalGames: 0,
          wins: 0,
          recentActivity: "Ei pelejä vielä"
        });
        
        await fetchRecentPhotos();
        await fetchWeather();
      } catch (error) {
        console.error("Virhe käyttäjätietojen lukemisessa:", error);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up interval to refresh photos every 30 seconds
    const photoInterval = setInterval(fetchRecentPhotos, 30000);
    
    return () => {
      clearInterval(photoInterval);
    };
  }, [router, fetchRecentPhotos, fetchWeather]);

  // Helper functions for weather effects
  const isNightTime = () => {
    if (!weather) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < weather.current.sunrise || now > weather.current.sunset;
  };

  const getWeatherCondition = () => {
    if (!weather || !weather.current.weather[0]) return 'clear';
    return weather.current.weather[0].main.toLowerCase();
  };

  const getBackgroundImage = () => {
    const condition = getWeatherCondition();
    const isNight = isNightTime();
    
    if (condition === 'rain') return '/weather-rain.png';
    if (condition === 'snow') return '/weather-snow.png';
    if (isNight) return '/weather-night.png';
    return '/weather-day.png';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const quickActions = [
    { href: "/photos", icon: "📸", title: "Kuvat", description: "Jaa juhlakuvia", color: "bg-blue-500" },
    { href: "/games", icon: "🎯", title: "Pelit", description: "Aloita peli", color: "bg-green-500" },
    { href: "/molkky", icon: "🎲", title: "Mölkky", description: "Heittopeli", color: "bg-purple-500" },
    { href: "/records", icon: "🏆", title: "Tulokset", description: "Katso ennätykset", color: "bg-yellow-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0FFF0' }}>
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌿</div>
          <div className="text-xl" style={{ fontFamily: 'Nunito, sans-serif', color: '#2F4F4F' }}>
            Ladataan...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#F0FFF0' }}>
      {/* Dynamic Weather Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src={getBackgroundImage()}
          alt="Dynamic Weather Background"
          fill
          className="object-cover opacity-50"
          quality={100}
          priority
        />
      </div>

      {/* Weather Effects */}
      {weather && (
        <WeatherEffects 
          weatherCondition={getWeatherCondition()}
          isNight={isNightTime()}
          intensity={1}
        />
      )}

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
            Juhannus 2025
          </h1>
          <p 
            className="text-xl md:text-2xl mb-2"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              color: '#DAA520'
            }}
          >
            Tervetuloa takaisin, {user?.name}! 🌲
          </p>
          
          {/* Weather Widget */}
          {weather && (
            <div className="flex justify-center mb-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-200 shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getWeatherCondition() === 'rain' ? '🌧️' : 
                     getWeatherCondition() === 'snow' ? '❄️' : 
                     getWeatherCondition() === 'clouds' ? '☁️' : 
                     isNightTime() ? '🌙' : '☀️'}
                  </span>
                  <div>
                    <div 
                      className="font-bold text-lg"
                      style={{ 
                        fontFamily: 'Fredoka One, cursive',
                        color: '#228B22'
                      }}
                    >
                      {Math.round(weather.current.temp)}°C
                    </div>
                    <div 
                      className="text-sm"
                      style={{ 
                        fontFamily: 'Nunito, sans-serif',
                        color: '#2F4F4F'
                      }}
                    >
                      {weather.location.name}, {weather.location.country}
                    </div>
                  </div>
                  <div 
                    className="text-sm"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    {currentTime.toLocaleTimeString('fi-FI', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Bonfire */}
        <div className="flex justify-center mb-8">
          <div 
            className="relative cursor-pointer group"
            onClick={() => setBonfireLit(!bonfireLit)}
          >
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <Image
                src={bonfireLit ? "/bonfire-lit.png" : "/bonfire-unlit.png"}
                alt="Juhannus Kokko"
                fill
                className="object-contain transition-all duration-500"
              />
              {bonfireLit && (
                <>
                  <div className="absolute inset-0 animate-pulse">
                    <div className="absolute inset-0 bg-orange-500 opacity-20 blur-xl rounded-full scale-125"></div>
                  </div>
                  {/* Spark particles */}
                  <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2">
                    <div className="absolute animate-float-up">✨</div>
                    <div className="absolute animate-float-up animation-delay-200">🔥</div>
                    <div className="absolute animate-float-up animation-delay-400">✨</div>
                  </div>
                </>
              )}
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 px-4 py-2 rounded-lg shadow-md text-center">
              <p 
                className="text-sm font-bold"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#228B22'
                }}
              >
                {bonfireLit ? "🔥 Kokko palaa!" : "🪵 Sytytä kokko"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-green-300">
                  <Image
                    src={user?.photoUrl || ""}
                    alt={user?.name || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 
                  className="text-xl font-bold mb-2"
                  style={{ 
                    fontFamily: 'Fredoka One, cursive',
                    color: '#228B22'
                  }}
                >
                  {user?.name}
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'Nunito, sans-serif', color: '#2F4F4F' }}>
                      Pelit yhteensä:
                    </span>
                    <span 
                      className="font-bold"
                      style={{ fontFamily: 'Nunito, sans-serif', color: '#228B22' }}
                    >
                      {gameStats.totalGames}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'Nunito, sans-serif', color: '#2F4F4F' }}>
                      Voitot:
                    </span>
                    <span 
                      className="font-bold"
                      style={{ fontFamily: 'Nunito, sans-serif', color: '#DAA520' }}
                    >
                      {gameStats.wins}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                Pikavalikon
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="group p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all hover:scale-105 bg-white"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{action.icon}</div>
                      <div 
                        className="font-bold text-sm mb-1"
                        style={{ 
                          fontFamily: 'Fredoka One, cursive',
                          color: '#228B22'
                        }}
                      >
                        {action.title}
                      </div>
                      <div 
                        className="text-xs opacity-75"
                        style={{ 
                          fontFamily: 'Nunito, sans-serif',
                          color: '#2F4F4F'
                        }}
                      >
                        {action.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Photos */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-xl font-bold"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                📸 Viimeisimmät Kuvat
              </h3>
              <Link 
                href="/photos"
                className="text-sm text-green-600 hover:text-green-700"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Näytä kaikki →
              </Link>
            </div>
            
            {recentPhotos.length > 0 ? (
              <div className="space-y-3">
                {recentPhotos.slice(0, 3).map((photo) => (
                  <div key={photo.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-green-200 flex-shrink-0">
                      {photo.photoUrl !== 'highscore' ? (
                        <Image
                          src={photo.photoUrl}
                          alt={photo.caption || ""}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-lg">🏆</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-green-300 flex-shrink-0">
                          <Image
                            src={photo.user.photoUrl}
                            alt={photo.user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span 
                          className="text-sm font-medium truncate"
                          style={{ 
                            fontFamily: 'Nunito, sans-serif',
                            color: '#228B22'
                          }}
                        >
                          {photo.user.name}
                        </span>
                      </div>
                      <p 
                        className="text-xs opacity-75 truncate"
                        style={{ 
                          fontFamily: 'Nunito, sans-serif',
                          color: '#2F4F4F'
                        }}
                      >
                        {photo.caption || (photo.photoUrl === 'highscore' ? 'Uusi ennätys!' : 'Ei kuvausta')}
                      </p>
                    </div>
                    <span 
                      className="text-xs opacity-50 flex-shrink-0"
                      style={{ 
                        fontFamily: 'Nunito, sans-serif',
                        color: '#2F4F4F'
                      }}
                    >
                      {formatDate(photo.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📱</div>
                <p 
                  className="text-gray-500"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Ei kuvia vielä
                </p>
                <Link
                  href="/photos"
                  className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Lisää ensimmäinen kuva
                </Link>
              </div>
            )}
          </div>

          {/* Game Activity */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-xl font-bold"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                🎯 Peliaktiviteetti
              </h3>
              <Link 
                href="/games"
                className="text-sm text-green-600 hover:text-green-700"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Pelaa →
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#228B22'
                    }}
                  >
                    🎯 Tikka
                  </span>
                  <span 
                    className="text-xs opacity-75"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    Paras: ? / 50
                  </span>
                </div>
                <Link
                  href="/games"
                  className="inline-block px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Pelaa nyt
                </Link>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#7C3AED'
                    }}
                  >
                    ⛳ Putting
                  </span>
                  <span 
                    className="text-xs opacity-75"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    Paras: ? / 10
                  </span>
                </div>
                <Link
                  href="/games"
                  className="inline-block px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Pelaa nyt
                </Link>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#EA580C'
                    }}
                  >
                    🍺 Beer Pong
                  </span>
                  <span 
                    className="text-xs opacity-75"
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    Voitot: {gameStats.wins}
                  </span>
                </div>
                <Link
                  href="/games"
                  className="inline-block px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Pelaa nyt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}