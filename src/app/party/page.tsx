"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

export default function Party() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<User | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<PhotoMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRecentPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (response.ok) {
        const photos = await response.json();
        // Take only the 5 most recent photos
        setRecentPhotos(photos.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

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
        await fetchRecentPhotos();
      } catch (error) {
        console.error("Virhe käyttäjätietojen lukemisessa:", error);
        router.push("/signin");
      }
    };

    checkAuth();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Fixed background image - responsive behavior */}
      <div className="fixed inset-0 z-0 sm:bg-black" style={{ top: '64px' }}>
        <Image
          src="/photo_of_me.jpg"
          alt="Background"
          fill
          className="object-cover sm:object-contain"
          quality={100}
          priority
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10">
        {/* Hero section with transparent background */}
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-20">
          <div className="text-center text-white">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 drop-shadow-lg" style={{ fontFamily: 'var(--font-dancing)' }}>
              Saku 30v
            </h1>
            <p className="text-xl sm:text-2xl drop-shadow-lg mb-2" style={{ fontFamily: 'var(--font-dancing)' }}>
              ja Insinööri
            </p>
          </div>
        </div>

        {/* Content sections with transparent background */}
        <div className="min-h-screen">
          <div className="max-w-4xl mx-auto p-4 space-y-8">
            {/* Party Info Section */}
            <div className="p-6 sm:p-8 -mt-20">
              <h2 className="text-5xl font-bold text-black mb-2 text-center" style={{ fontFamily: 'var(--font-dancing)', textShadow: '2px 2px 3px rgba(255,255,255,0.7), -2px -2px 3px rgba(255,255,255,0.7), 2px -2px 3px rgba(255,255,255,0.7), -2px 2px 3px rgba(255,255,255,0.7)' }}>Tervetuloa juhliini!</h2>
              <div className="w-48 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mb-6 rounded-full shadow-lg"></div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-white mb-6 text-center drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Juhlien aikataulu</h3>
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Klo 16:00</span>
                    <span className="text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Vieraat saapuvat</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Klo 17:00</span>
                    <span className="text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Ohjelma alkaa</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Klo 19:00</span>
                    <span className="text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Kakkukahvit</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Klo 21:00</span>
                    <span className="text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Grillailua ja Sauna</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Klo 23:00-06:00</span>
                    <span className="text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Juhlat jatkuvat yöhön asti</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Klo 11:00</span>
                    <span className="text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Teltan purku</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-6 sm:p-8">
              <h2 className="text-4xl font-bold text-black mb-2 text-center" style={{ fontFamily: 'var(--font-dancing)', textShadow: '2px 2px 3px rgba(255,255,255,0.7), -2px -2px 3px rgba(255,255,255,0.7), 2px -2px 3px rgba(255,255,255,0.7), -2px 2px 3px rgba(255,255,255,0.7)' }}>Mitä tehdä?</h2>
              <div className="w-40 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mb-6 rounded-full shadow-lg"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/photos" className="group block p-6 text-center border-2 border-white/50 rounded-xl hover:border-white hover:bg-white/10 transition-all backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-pink-400 group-hover:text-pink-300 transition-colors mb-2 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Juhlakuvat
                  </h3>
                  <p className="text-white text-sm drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Lataa ja katso hauskoja juhlakuvia</p>
                </Link>
                
                <Link href="/games" className="group block p-6 text-center border-2 border-white/50 rounded-xl hover:border-white hover:bg-white/10 transition-all backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors mb-2 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Pelit
                  </h3>
                  <p className="text-white text-sm drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Tikanheitto, puttaus, kaljakellotus ja beer pong</p>
                </Link>
                
                <Link href="/records" className="group block p-6 text-center border-2 border-white/50 rounded-xl hover:border-white hover:bg-white/10 transition-all backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors mb-2 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Tulokset
                  </h3>
                  <p className="text-white text-sm drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Katso omat ja muiden pelitulokset</p>
                </Link>
                
                <Link href="/icebreaker" className="group block p-6 text-center border-2 border-white/50 rounded-xl hover:border-white hover:bg-white/10 transition-all backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors mb-2 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Tutustumispeli
                  </h3>
                  <p className="text-white text-sm drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Tutustu muihin vieraisiin</p>
                </Link>
              </div>
            </div>

            {/* Recent Photos Feed */}
            {recentPhotos.length > 0 && (
              <div className="p-6 sm:p-8">
                <h2 className="text-4xl font-bold text-black mb-2 text-center" style={{ fontFamily: 'var(--font-dancing)', textShadow: '2px 2px 3px rgba(255,255,255,0.7), -2px -2px 3px rgba(255,255,255,0.7), 2px -2px 3px rgba(255,255,255,0.7), -2px 2px 3px rgba(255,255,255,0.7)' }}>Juhlien päivitykset</h2>
                <div className="w-40 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mb-6 rounded-full shadow-lg"></div>
                <div className="text-center mb-6">
                  <Link href="/photos" className="text-white hover:text-purple-300 font-medium text-sm drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    Katso kaikki →
                  </Link>
                </div>
                
                <div className="space-y-6 max-w-md mx-auto">
                  {recentPhotos.map((photo, index) => (
                    <div key={photo.id}>
                      <div className="pb-6 text-center">
                        <div className="flex items-center justify-center space-x-3 mb-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/50">
                            <Image
                              src={photo.user.photoUrl}
                              alt={photo.user.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>{photo.user.name}</p>
                            <p className="text-xs text-white/80 drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>{formatDate(photo.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-3">
                          <Image
                            src={photo.photoUrl}
                            alt={photo.caption || "Juhlahetki"}
                            fill
                            className="object-contain"
                          />
                        </div>
                        
                        {photo.caption && (
                          <p className="text-white text-base drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>{photo.caption}</p>
                        )}
                      </div>
                      {index < recentPhotos.length - 1 && (
                        <div className="w-3/4 h-px bg-white/30 mx-auto"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No photos yet */}
            {recentPhotos.length === 0 && (
              <div className="p-6 sm:p-8 text-center">
                <h2 className="text-4xl font-bold text-black mb-2 text-center" style={{ fontFamily: 'var(--font-dancing)', textShadow: '2px 2px 3px rgba(255,255,255,0.7), -2px -2px 3px rgba(255,255,255,0.7), 2px -2px 3px rgba(255,255,255,0.7), -2px 2px 3px rgba(255,255,255,0.7)' }}>Juhlien päivitykset</h2>
                <div className="w-40 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mb-6 rounded-full shadow-lg"></div>
                <div className="text-5xl mb-4">📷</div>
                <p className="text-lg text-white mb-2 drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Ei kuvia vielä!</p>
                <p className="text-white/80 mb-4 text-sm drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Ole ensimmäinen, joka jakaa juhlamuiston.</p>
                <Link
                  href="/photos"
                  className="inline-block px-6 py-3 bg-white/20 border-2 border-white/50 text-white rounded-lg hover:bg-white/30 hover:border-white transition-all"
                >
                  Lisää kuva
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}