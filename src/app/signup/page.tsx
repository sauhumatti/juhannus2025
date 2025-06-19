"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary konfiguraatio puuttuu');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(`Kuvan lataus epäonnistui: ${errorData.error?.message || 'Tuntematon virhe'}`);
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!photo || !username || !password) {
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
        body: JSON.stringify({ username, name: username, password, photoUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Rekisteröityminen epäonnistui');
      }

      const user = await response.json();
      sessionStorage.setItem("user", JSON.stringify(user));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rekisteröityminen epäonnistui');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#F0FFF0' }}>
      {/* Forest Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/juhannus2025.png"
          alt="Juhannus 2025 Forest Background"
          fill
          className="object-cover opacity-70"
          quality={100}
          priority
        />
        {/* Gentle forest overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-green-800/15 to-green-700/20" />
      </div>

      {/* Floating forest elements */}
      <div className="fixed inset-0 z-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="floating-element"
            style={{
              position: 'absolute',
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              fontSize: '1.2rem',
              animation: `gentleFloat ${6 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 6}s`,
              opacity: 0.7
            }}
          >
            {i % 3 === 0 ? '🍃' : i % 3 === 1 ? '🦋' : '🌿'}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-200 p-8 space-y-8">
          <div className="text-center">
            <div className="mb-4">
              <span 
                className="text-4xl font-bold"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  background: 'linear-gradient(135deg, #228B22, #32CD32)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                🌲 Luo Polkusi
              </span>
            </div>
            <p 
              className="text-lg"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Liity Juhannus 2025 juhlailijoiden joukkoon
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium mb-2"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#228B22'
                }}
              >
                🦋 Käyttäjänimi
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all outline-none"
                placeholder="Valitse käyttäjänimi"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#228B22'
                }}
              >
                🍄 Salasana
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all outline-none"
                placeholder="Luo salasana"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              />
            </div>

            <div>
              <label 
                htmlFor="photo" 
                className="block text-sm font-medium mb-2"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#228B22'
                }}
              >
                📸 Profiilikuva
              </label>
              <p 
                className="text-xs mb-3"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#2F4F4F'
                }}
              >
                Kuva itsestäsi juhannusviettoon
              </p>
              <div className="flex flex-col items-center space-y-4">
                {preview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-green-300">
                    <Image
                      src={preview}
                      alt="Profiilikuva"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center">
                    <span className="text-3xl">🌲</span>
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
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:opacity-90"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    backgroundColor: '#DAA520',
                    color: 'white'
                  }}
                >
                  {preview ? "🔄 Vaihda kuva" : "📱 Lataa kuva"}
                </button>
              </div>
            </div>

            {error && (
              <div 
                className="text-center p-3 bg-red-50 border border-red-200 rounded-lg"
                style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  color: '#DC2626'
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username || !password || !photo}
              className="w-full py-3 px-4 text-white rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                backgroundColor: '#228B22'
              }}
            >
              {isLoading ? "🌿 Luodaan polkua..." : "🍄 Astu Juhannukseen"}
            </button>

            <div 
              className="text-center text-sm"
              style={{ 
                fontFamily: 'Nunito, sans-serif',
                color: '#2F4F4F'
              }}
            >
              Onko sinulla jo pääsy juhannukseen?{" "}
              <Link 
                href="/signin" 
                className="font-medium hover:underline"
                style={{ color: '#228B22' }}
              >
                Kirjaudu sisään
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(15px, -15px) rotate(8deg); }
          50% { transform: translate(-8px, -20px) rotate(-5deg); }
          75% { transform: translate(-12px, -8px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}