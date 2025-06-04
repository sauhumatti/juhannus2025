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
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center px-2 py-2">
                <span className="text-3xl font-bold text-gray-900 dancing-font">
                  Saku 30v
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
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href={user ? "/party" : "/"}
              className="flex items-center px-2 py-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-3xl font-bold text-gray-900 dancing-font">
                Saku 30v
              </span>
            </Link>
          </div>

          {/* Hamburger menu button - hide on landing page */}
          {!isLandingPage && (
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
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
                  href="/menu"
                  className={`px-3 py-2 rounded-lg ${
                    pathname === "/menu"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Ruoka ja Juomalista
                </Link>
                <Link
                  href="/photos"
                  className={`px-3 py-2 rounded-lg ${
                    pathname === "/photos"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Juhlakuvat
                </Link>
                <Link
                  href="/games"
                  className={`px-3 py-2 rounded-lg ${
                    pathname === "/games" || pathname === "/icebreaker"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Pelit
                </Link>
                <Link
                  href="/records"
                  className={`px-3 py-2 rounded-lg ${
                    pathname === "/records"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Tulokset
                </Link>
                {isAdmin && (
                   <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg ${
                      pathname === "/admin"
                        ? "bg-red-100 text-red-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className={`flex items-center px-3 py-2 rounded-lg ${
                    pathname === "/profile"
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                    <Image
                      src={user.photoUrl}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-gray-700">{user.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  Kirjaudu
                </Link>
                <Link
                  href="/signup"
                  className="px-2 sm:px-3 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Luo tili
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden bg-white border-t relative z-50`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {user ? (
            <>
              <Link
                href="/menu"
                className={`block px-3 py-2 rounded-lg ${
                  pathname === "/menu"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Ruoka ja Juomalista
              </Link>
              <Link
                href="/photos"
                className={`block px-3 py-2 rounded-lg ${
                  pathname === "/photos"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Juhlakuvat
              </Link>
              <Link
                href="/games"
                className={`block px-3 py-2 rounded-lg ${
                  pathname === "/games" || pathname === "/icebreaker"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Pelit
              </Link>
              <Link
                href="/records"
                className={`block px-3 py-2 rounded-lg ${
                  pathname === "/records"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Tulokset
              </Link>
               {isAdmin && (
                   <Link
                    href="/admin"
                    className={`block px-3 py-2 rounded-lg ${
                      pathname === "/admin"
                        ? "bg-red-100 text-red-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Admin
                  </Link>
                )}
              <Link
                href="/profile"
                className={`flex items-center px-3 py-2 rounded-lg ${
                  pathname === "/profile"
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                  <Image
                    src={user.photoUrl}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-gray-700">{user.name}</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Kirjaudu sisään
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Luo tili
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
