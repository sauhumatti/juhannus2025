"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Kuvan lataus epäonnistui');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!photo || !username || !name) {
        throw new Error('Täytä kaikki kentät');
      }

      // Upload image to Cloudinary
      const photoUrl = await uploadToCloudinary(photo);

      // Create user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, name, photoUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Rekisteröityminen epäonnistui');
      }

      const user = await response.json();
      sessionStorage.setItem("user", JSON.stringify(user));
      router.push('/party');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rekisteröityminen epäonnistui');
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Liity mukaan juhliin!</h1>
          <p className="text-gray-600">Luo juhlaprofiilisi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Käyttäjänimi
            </label>
            <p className="text-xs text-gray-500 mb-2">Tällä kirjaudut sisään</p>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="Valitse käyttäjänimi"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nimi
            </label>
            <p className="text-xs text-gray-500 mb-2">Etunimesi, tämä näkyy myös muille</p>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="Syötä nimesi"
            />
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
              Profiilikuva
            </label>
            <p className="text-xs text-gray-500 mb-2">Kuva itsestäsi: tämä näkyy myös muille</p>
            <div className="mt-1 flex flex-col items-center space-y-4">
              {preview ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <Image
                    src={preview}
                    alt={name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
              <input
                id="photo"
                type="file"
                accept="image/*"
                required
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("photo")?.click()}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {preview ? "Vaihda kuva" : "Lataa kuva"}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username || !name || !photo}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Luodaan tiliä..." : "Luo tili"}
          </button>

          <div className="text-center text-sm text-gray-600">
            Onko sinulla jo tili?{" "}
            <Link href="/signin" className="text-blue-600 hover:underline">
              Kirjaudu sisään
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}