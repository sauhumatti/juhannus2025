"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface User {
  username: string;
  name: string;
  photoUrl: string;
}

export default function Party() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      router.push("/signin");
      return;
    }
    
    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Virhe käyttäjätietojen lukemisessa:", error);
      router.push("/signin");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden">
              <Image
                src={user.photoUrl}
                alt={user.name}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">@{user.username}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tervetuloa juhliin!</h2>
          <p className="text-gray-600 mb-4">
            Pääset pelaamaan juhlapelejä ja katsomaan tuloksia yläpalkin linkeistä. 
            Kaikki tuloksesi tallennetaan automaattisesti ja voit seurata edistymistäsi 
            tuloshistoriasta.
          </p>
        </div>

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