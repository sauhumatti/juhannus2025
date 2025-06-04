"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      router.push("/party");
    }
  }, [router]);

  useEffect(() => {
    // Start animations with delays
    const timer1 = setTimeout(() => setShowTitle(true), 600);
    const timer2 = setTimeout(() => setShowSubtitle(true), 1600);
    const timer3 = setTimeout(() => setShowDescription(true), 2600);
    const timer4 = setTimeout(() => setShowButtons(true), 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background image - responsive behavior */}
      <div className="fixed inset-0 z-0 sm:bg-black">
        <Image
          src="/photo_of_me.jpg"
          alt="Background"
          fill
          className="object-cover sm:object-contain"
          quality={100}
          priority
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl space-y-12">
          <div className="text-center text-white space-y-8">
            {/* Main title with fade-in animation */}
            <div className={`transition-all duration-1000 transform ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h1 className="text-5xl sm:text-7xl font-bold drop-shadow-2xl dancing-font">
                Tervetuloa
              </h1>
            </div>

            {/* Subtitle with fade-in animation */}
            <div className={`transition-all duration-1000 transform ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-3xl sm:text-5xl font-semibold drop-shadow-2xl dancing-font">
                Sakun 30v ja insinöörijuhliin
              </h2>
            </div>

            {/* Description with fade-in animation */}
            <div className={`transition-all duration-1000 transform ${showDescription ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
                Tämä on juhlien virallinen kotisivu joka samalla pieni taidonnäytteeni. 
                Kaikki juhliin liittyvät asiat löytyvät täältä. Tätä sivua käytetään 
                juhlien ohjelmanumeroihin. Siksi pyydänkin kaikkia luomaan käyttäjän 
                juhlia varten.
              </p>
            </div>
          </div>

          {/* Buttons with fade-in animation */}
          <div className={`space-y-4 max-w-md mx-auto transition-all duration-1000 transform ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link
              href="/signin"
              className="w-full flex items-center justify-center py-4 px-6 bg-white/10 backdrop-blur-md text-white rounded-xl font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all border border-white/30 shadow-xl"
            >
              Kirjaudu sisään
            </Link>
            <Link
              href="/signup"
              className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-xl transform hover:scale-105"
            >
              Luo tili
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
