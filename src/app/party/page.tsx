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
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 -mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Tervetuloa juhliini!</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Juhlien aikataulu</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">Klo 16:00</span>
                    <span className="text-gray-700">Vieraat saapuvat</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">Klo 17:00</span>
                    <span className="text-gray-700">Ohjelma alkaa</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">Klo 19:00</span>
                    <span className="text-gray-700">Kakkukahvit</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">Klo 21:00</span>
                    <span className="text-gray-700">Grillailua ja Sauna</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">Klo 23:00-06:00</span>
                    <span className="text-gray-700">Juhlat jatkuvat yöhön asti</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-900">Klo 11:00</span>
                    <span className="text-gray-700">Teltan purku</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mitä tehdä?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/photos" className="group">
                  <div className="p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                    <h3 className="text-lg font-semibold text-pink-900 group-hover:text-pink-700">
                      📸 Juhlakuvat
                    </h3>
                    <p className="text-pink-700 text-sm">Lataa ja katso hauskoja juhlakuvia</p>
                  </div>
                </Link>
                
                <Link href="/games" className="group">
                  <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <h3 className="text-lg font-semibold text-purple-900 group-hover:text-purple-700">
                      🎮 Pelit
                    </h3>
                    <p className="text-purple-700 text-sm">Tikanheitto, puttaus, kaljakellotus ja beer pong</p>
                  </div>
                </Link>
                
                <Link href="/records" className="group">
                  <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <h3 className="text-lg font-semibold text-green-900 group-hover:text-green-700">
                      🏆 Tulokset
                    </h3>
                    <p className="text-green-700 text-sm">Katso omat ja muiden pelitulokset</p>
                  </div>
                </Link>
                
                <Link href="/icebreaker" className="group">
                  <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <h3 className="text-lg font-semibold text-blue-900 group-hover:text-blue-700">
                      🎯 Tutustumispeli
                    </h3>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Photos Feed */}
            {recentPhotos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">📸 Tuoreimmat kuvat</h2>
                  <Link href="/photos" className="text-purple-600 hover:text-purple-800 font-medium text-sm">
                    Katso kaikki →
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentPhotos.map((photo) => (
                    <div key={photo.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={photo.user.photoUrl}
                            alt={photo.user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{photo.user.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(photo.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2 bg-gray-100">
                        <Image
                          src={photo.photoUrl}
                          alt={photo.caption || "Juhlahetki"}
                          fill
                          className="object-contain"
                        />
                      </div>
                      
                      {photo.caption && (
                        <p className="text-gray-700 text-sm">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No photos yet */}
            {recentPhotos.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
                <div className="text-5xl mb-4">📷</div>
                <p className="text-lg text-gray-700 mb-2">Ei kuvia vielä!</p>
                <p className="text-gray-500 mb-4 text-sm">Ole ensimmäinen, joka jakaa juhlamuiston.</p>
                <Link
                  href="/photos"
                  className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Lisää kuva
                </Link>
              </div>
            )}

            <button
              onClick={() => {
                sessionStorage.removeItem("user");
                router.push("/");
              }}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-8"
            >
              Kirjaudu ulos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}