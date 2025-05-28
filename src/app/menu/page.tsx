"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  name: string;
}

export default function Menu() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      router.push("/signin");
      return;
    }
    
    setUser(JSON.parse(storedUser));
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Ruokalista</h1>
          
          {/* Placeholder content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Alkupalat</h2>
              <p className="text-gray-600 italic">Tulossa pian...</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Pääruoat</h2>
              <p className="text-gray-600 italic">Tulossa pian...</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Jälkiruoat</h2>
              <p className="text-gray-600 italic">Tulossa pian...</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Juomat</h2>
              <p className="text-gray-600 italic">Tulossa pian...</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">
                Ruokalista päivitetään lähempänä juhlia. Ilmoitathan mahdolliset 
                ruoka-aineallergiat ja erikoisruokavaliot etukäteen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}