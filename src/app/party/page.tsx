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
  }, []);

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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Party Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 Sakun 30v Synttärit!</h1>
          <p className="text-xl text-gray-700 mb-2">
            Tervetuloa juhlimaan! 
          </p>
          <p className="text-gray-600">
            Täällä voit pelata juhlapeleja, jakaa kuvia ja muistoja sekä tutustua muihin juhlijoihin.
            Kaikki tuloksesi tallentuvat automaattisesti ja voit seurata edistymistäsi.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>📅 Lauantai 6.2.2025</p>
            <p>📍 Juhlapaikka</p>
            <p>🕒 Klo 18:00 alkaen</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mitä tehdä?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/games" className="group">
              <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <h3 className="text-lg font-semibold text-purple-900 group-hover:text-purple-700">
                  🎮 Juhlapelat
                </h3>
                <p className="text-purple-700">Tikkapeli, minigolf, olutpeli ja beer pong</p>
              </div>
            </Link>
            
            <Link href="/icebreaker" className="group">
              <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <h3 className="text-lg font-semibold text-blue-900 group-hover:text-blue-700">
                  🎯 Tutustumispeli
                </h3>
                <p className="text-blue-700">Opi tuntemaan muut juhlijat</p>
              </div>
            </Link>
            
            <Link href="/photos" className="group">
              <div className="p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                <h3 className="text-lg font-semibold text-pink-900 group-hover:text-pink-700">
                  📸 Kuvamuistot
                </h3>
                <p className="text-pink-700">Jaa ja katso juhlahetkiä</p>
              </div>
            </Link>
            
            <Link href="/records" className="group">
              <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <h3 className="text-lg font-semibold text-green-900 group-hover:text-green-700">
                  🏆 Tulostaulukot
                </h3>
                <p className="text-green-700">Katso pelien tuloksia</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Photos Feed */}
        {recentPhotos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">📸 Tuoreimmat kuvat</h2>
              <Link href="/photos" className="text-purple-600 hover:text-purple-800 font-medium">
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
                      <p className="font-medium text-gray-900">{photo.user.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(photo.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={photo.photoUrl}
                      alt={photo.caption || "Juhlahetki"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {photo.caption && (
                    <p className="text-gray-700">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No photos yet */}
        {recentPhotos.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-xl text-gray-700 mb-2">Ei kuvia vielä!</p>
            <p className="text-gray-500 mb-4">Ole ensimmäinen, joka jakaa juhlamuiston.</p>
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
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Kirjaudu ulos
        </button>
      </div>
    </div>
  );
}