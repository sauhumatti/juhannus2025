"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      router.push("/party");
    }
  }, [router]);

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/photo_of_me.jpg"
          alt="Background"
          fill
          className="object-cover object-center"
          quality={100}
          priority
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 drop-shadow-lg">
              Tervetuloa Sakun 30v ja insinöörijuhliin
            </h1>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-8">
              <p className="text-gray-800 text-lg leading-relaxed">
                Tämä on juhlien virallinen kotisivu joka samalla pieni taidonnäytteeni. 
                Kaikki juhliin liittyvät asiat löytyvät täältä. Tätä sivua käytetään 
                juhlien ohjelmanumeroihin. Siksi pyydänkin kaikkia luomaan käyttäjän 
                juhlia varten.
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <Link
              href="/signin"
              className="w-full flex items-center justify-center py-3 px-4 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all border border-white/20 shadow-lg"
            >
              Kirjaudu sisään
            </Link>
            <Link
              href="/signup"
              className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg"
            >
              Luo tili
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
