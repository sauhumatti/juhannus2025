"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface User {
  id: string;
  username: string;
  name: string;
  photoUrl: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Effect to set mounted state (runs only once on client)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to check user session storage (runs when mounted or pathname changes)
  useEffect(() => {
    // Only run on the client side after component has mounted
    if (!mounted) {
      return;
    }

    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from sessionStorage:", error);
        sessionStorage.removeItem("user"); // Clear corrupted data
        setUser(null);
      }
    } else {
      setUser(null); // Ensure user is cleared if not in sessionStorage
    }
  }, [pathname, mounted]); // Re-run when pathname changes or when component initially mounts

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Show loading state until component is mounted and user state is determined
  if (!mounted) {
    return (
      <nav 
        className="shadow-lg sticky top-0 z-50"
        style={{ 
          background: 'linear-gradient(135deg, #F0FFF0 0%, rgba(240, 255, 240, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(34, 139, 34, 0.2)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center px-2 py-2">
                <span 
                  className="text-3xl font-bold"
                  style={{ 
                    fontFamily: 'Fredoka One, cursive',
                    background: 'linear-gradient(135deg, #228B22, #32CD32)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  🌲 Juhannus 2025
                </span>
              </div>
            </div>
            <div className="flex items-center">
              {/* Optional loading indicator */}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Check if user is admin
  const isAdmin = user?.username === "admin";
  
  // Check if we're on the landing page
  const isLandingPage = pathname === "/" && !user;

  return (
    <nav 
      className="shadow-lg sticky top-0 z-50"
      style={{ 
        background: 'linear-gradient(135deg, #F0FFF0 0%, rgba(240, 255, 240, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(34, 139, 34, 0.2)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center px-2 py-2 hover:opacity-80 transition-opacity"
            >
              <span 
                className="text-3xl font-bold"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  background: 'linear-gradient(135deg, #228B22, #32CD32)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                🌲 Juhannus 2025
              </span>
            </Link>
          </div>

          {/* Hamburger menu button - hide on landing page */}
          {!isLandingPage && (
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-green-100 focus:outline-none transition-colors"
                style={{ color: '#2F4F4F' }}
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          )}

          {/* Desktop navigation - on landing page, show on mobile too */}
          <div className={`${isLandingPage ? 'flex' : 'hidden sm:flex'} items-center space-x-4`}>
            {user ? (
              <>
                <Link
                  href="/photos"
                  className={`px-3 py-2 rounded-lg transition-all ${
                    pathname === "/photos"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "text-slate-700 hover:text-green-700 hover:bg-green-50"
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  📸 Juhannuskuvat
                </Link>
                <Link
                  href="/games"
                  className={`px-3 py-2 rounded-lg transition-all ${
                    pathname === "/games" || pathname === "/molkky"
                      ? "bg-amber-100 text-amber-700 border border-amber-300"
                      : "text-slate-700 hover:text-amber-700 hover:bg-amber-50"
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  🎯 Perinteiset Leikit
                </Link>
                <Link
                  href="/records"
                  className={`px-3 py-2 rounded-lg transition-all ${
                    pathname === "/records"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "text-slate-700 hover:text-green-700 hover:bg-green-50"
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  🏆 Juhannustulokset
                </Link>
                {isAdmin && (
                   <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg transition-all ${
                      pathname === "/admin"
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "text-slate-700 hover:text-red-700 hover:bg-red-50"
                    }`}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    ⚙️ Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                    pathname === "/profile"
                      ? "bg-green-100 border border-green-300"
                      : "hover:bg-green-50"
                  }`}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 border-2 border-green-300">
                    <Image
                      src={user.photoUrl}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span 
                    style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      color: '#2F4F4F'
                    }}
                  >
                    {user.name}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-2 sm:px-3 py-2 text-sm sm:text-base rounded-lg transition-all hover:bg-green-50"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: '#2F4F4F'
                  }}
                >
                  🌿 Kirjaudu
                </Link>
                <Link
                  href="/signup"
                  className="px-2 sm:px-3 py-2 text-sm sm:text-base text-white rounded-lg hover:opacity-90 transition-all"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    backgroundColor: '#228B22'
                  }}
                >
                  🍄 Luo tili
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`${isMenuOpen ? "block" : "hidden"} sm:hidden border-t relative z-50`}
        style={{ 
          backgroundColor: 'rgba(240, 255, 240, 0.98)',
          borderTopColor: 'rgba(34, 139, 34, 0.3)'
        }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {user ? (
            <>
              <Link
                href="/photos"
                className={`block px-3 py-2 rounded-lg transition-all ${
                  pathname === "/photos"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "text-slate-700 hover:text-green-700 hover:bg-green-50"
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                📸 Juhannuskuvat
              </Link>
              <Link
                href="/games"
                className={`block px-3 py-2 rounded-lg transition-all ${
                  pathname === "/games" || pathname === "/molkky"
                    ? "bg-amber-100 text-amber-700 border border-amber-300"
                    : "text-slate-700 hover:text-amber-700 hover:bg-amber-50"
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                🎯 Perinteiset Leikit
              </Link>
              <Link
                href="/records"
                className={`block px-3 py-2 rounded-lg transition-all ${
                  pathname === "/records"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "text-slate-700 hover:text-green-700 hover:bg-green-50"
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                🏆 Juhannustulokset
              </Link>
               {isAdmin && (
                   <Link
                    href="/admin"
                    className={`block px-3 py-2 rounded-lg transition-all ${
                      pathname === "/admin"
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "text-slate-700 hover:text-red-700 hover:bg-red-50"
                    }`}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    ⚙️ Admin
                  </Link>
                )}
              <Link
                href="/profile"
                className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                  pathname === "/profile"
                    ? "bg-green-100 border border-green-300"
                    : "hover:bg-green-50"
                }`}
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 border-2 border-green-300">
                  <Image
                    src={user.photoUrl}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span 
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: '#2F4F4F'
                  }}
                >
                  {user.name}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="block px-3 py-2 rounded-lg transition-all hover:bg-green-50"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                🌿 Kirjaudu sisään
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  backgroundColor: '#228B22'
                }}
              >
                🍄 Luo tili
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}