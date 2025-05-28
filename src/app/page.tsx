"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      router.push("/party");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tervetuloa juhliin!
          </h1>
          <p className="text-xl text-gray-600">
            Liity mukaan ja jaa hetkesi
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/signin"
            className="w-full flex items-center justify-center py-3 px-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all border border-gray-200"
          >
            Kirjaudu sisään
          </Link>
          <Link
            href="/signup"
            className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            Luo tili
          </Link>
        </div>
      </div>
    </div>
  );
}
