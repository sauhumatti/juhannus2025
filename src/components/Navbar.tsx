"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface User {
  name: string;
  photoUrl: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href={user ? "/party" : "/"}
              className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
            >
              <span className="text-xl font-bold">Juhlat</span>
            </Link>
          </div>

          {/* Hamburger menu button */}
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

          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
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
                  Ruokalista
                </Link>
                <Link
                  href="/games"
                  className={`px-3 py-2 rounded-lg ${
                    pathname === "/games"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Pelit
                </Link>
                <Link
                  href="/icebreaker"
                  className={`px-3 py-2 rounded-lg ${
                    pathname === "/icebreaker"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Tutustumispeli
                </Link>
                <Link
                  href="/tulokset"
                  className={`px-3 py-2 rounded-lg ${
                    pathname === "/tulokset"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Tulokset
                </Link>
                <Link
                  href="/party"
                  className={`flex items-center px-3 py-2 rounded-lg ${
                    pathname === "/party"
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
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  Kirjaudu sisään
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Luo tili
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden bg-white border-t`}>
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
                Ruokalista
              </Link>
              <Link
                href="/games"
                className={`block px-3 py-2 rounded-lg ${
                  pathname === "/games"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Pelit
              </Link>
              <Link
                href="/icebreaker"
                className={`block px-3 py-2 rounded-lg ${
                  pathname === "/icebreaker"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Tutustumispeli
              </Link>
              <Link
                href="/tulokset"
                className={`block px-3 py-2 rounded-lg ${
                  pathname === "/tulokset"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Tulokset
              </Link>
              <Link
                href="/party"
                className={`flex items-center px-3 py-2 rounded-lg ${
                  pathname === "/party"
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