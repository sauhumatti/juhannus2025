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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8 border-2 border-amber-200">
          <h1 className="text-5xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-dancing)' }}>Menu</h1>
          <div className="w-32 h-1 bg-amber-400 mx-auto mb-8"></div>
          
          {/* Menu content */}
          <div className="space-y-8">
            {/* Food Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold mb-1" style={{ fontFamily: 'var(--font-dancing)' }}>Ruoka</h2>
              <div className="w-20 h-0.5 bg-amber-300 mx-auto mb-6"></div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2 uppercase tracking-wider text-sm">Alkupala</h3>
                  <p className="text-gray-700 italic">Makaronisalaatti ja patonki</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2 uppercase tracking-wider text-sm">Makea tarjoilu</h3>
                  <p className="text-gray-700 italic">Kakku ja kahvi</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2 uppercase tracking-wider text-sm">Iltapala</h3>
                  <p className="text-gray-700 italic">Grilliruoka: makkaraa, perunaa ja salaattia</p>
                </div>
              </div>
            </div>

            {/* Drinks Section */}
            <div className="text-center">
              <h2 className="text-3xl font-semibold mb-1" style={{ fontFamily: 'var(--font-dancing)' }}>Juomat</h2>
              <div className="w-20 h-0.5 bg-amber-300 mx-auto mb-6"></div>
              
              {/* Non-alcoholic drinks */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-amber-900 mb-3 uppercase tracking-wider text-sm">Alkoholittomat</h3>
                <p className="text-gray-700 italic">Pepsi, Fanta, Sprite</p>
              </div>

              {/* Cocktails */}
              <h3 className="text-lg font-semibold text-amber-900 mb-6 uppercase tracking-wider text-sm">Cocktailit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
                {/* Rum cocktails */}
                <div>
                  <h4 className="text-center font-semibold text-amber-800 mb-4 uppercase tracking-wide text-sm border-b border-amber-300 pb-2">Rommipohjaiset</h4>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <p className="font-semibold text-gray-900">Daiquiri</p>
                      <p className="text-gray-600 text-sm italic">Yksinkertainen klassikko rommicocktail</p>
                      <p className="text-gray-500 text-xs mt-1">Bacardi Blanca, siirappia, tuoretta limeä</p>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <p className="font-semibold text-gray-900">Mojito</p>
                      <p className="text-gray-600 text-sm italic">Raikas minttuinen kesäjuoma</p>
                      <p className="text-gray-500 text-xs mt-1">Bacardi Blanca, siirappia, tuoretta limeä, mintunlehtiä, soodavettä</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Dark and Stormy</p>
                      <p className="text-gray-600 text-sm italic">Tulinen inkivääricocktail</p>
                      <p className="text-gray-500 text-xs mt-1">Bacardi Blanca, tuoretta limeä, inkivääriolutta</p>
                    </div>
                  </div>
                </div>

                {/* Vodka cocktails */}
                <div>
                  <h4 className="text-center font-semibold text-amber-800 mb-4 uppercase tracking-wide text-sm border-b border-amber-300 pb-2">Vodkapohjaiset</h4>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <p className="font-semibold text-gray-900">Sex on the Beach</p>
                      <p className="text-gray-600 text-sm italic">Hedelmäinen klassikko</p>
                      <p className="text-gray-500 text-xs mt-1">Vodkaa, persikkalikööriä, karpalomehua, appelsiinimehua</p>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <p className="font-medium text-gray-900">Irma</p>
                      <p className="text-gray-600 text-sm italic">Omenainen twisti</p>
                      <p className="text-gray-500 text-xs mt-1">Vodkaa, omenalikööriä, sitruunalimua</p>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <p className="font-semibold text-gray-900">Cosmopolitan</p>
                      <p className="text-gray-600 text-sm italic">Tyylikäs cocktail</p>
                      <p className="text-gray-500 text-xs mt-1">Vodkaa, Triple Sec, tuoretta limeä, karpalomehua</p>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <p className="font-semibold text-gray-900">Lemon Drop</p>
                      <p className="text-gray-600 text-sm italic">Kirpeän raikas</p>
                      <p className="text-gray-500 text-xs mt-1">Vodkaa, Triple Sec, tuoretta sitruunaa, siirappia</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Moscow Mule</p>
                      <p className="text-gray-600 text-sm italic">Raikas inkiväärijuoma</p>
                      <p className="text-gray-500 text-xs mt-1">Vodkaa, tuoretta limeä, inkivääriolutta</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}