"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: string;
  username: string;
  name: string;
  photoUrl: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        router.push("/signin");
        return;
      }
      
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Virhe käyttäjätietojen lukemisessa:", error);
        router.push("/signin");
      }
    };

    checkAuth();
  }, [router]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Get upload signature
      const signatureRes = await fetch("/api/photos/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "profile-photos" }),
      });

      if (!signatureRes.ok) {
        throw new Error("Failed to get upload signature");
      }
      
      const signatureData = await signatureRes.json();

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", signatureData.upload_preset);
      formData.append("folder", signatureData.folder);
      
      if (signatureData.signature) {
        formData.append("timestamp", signatureData.timestamp.toString());
        formData.append("signature", signatureData.signature);
        formData.append("api_key", signatureData.api_key);
      }

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }
      
      const uploadData = await uploadRes.json();

      // Update user profile
      const updateRes = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrl: uploadData.secure_url,
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to update profile");

      const updatedUser = await updateRes.json();
      
      // Update session storage
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess("Profiilikuva päivitetty!");
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      setError("Virhe kuvan latauksessa");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Ladataan...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mt-4 sm:mt-8 border-2 border-purple-200">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-dancing)' }}>Oma profiili</h1>
          <div className="w-32 h-1 bg-purple-400 mx-auto mb-8"></div>
          
          <div className="space-y-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-4">
                  <Image
                    src={user.photoUrl}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Ladataan...
                    </>
                  ) : (
                    <>
                      📷 Vaihda kuva
                    </>
                  )}
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">{user.name}</h2>
                <p className="text-gray-600 mb-1">@{user.username}</p>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                    {success}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pikavalinnat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/records"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="font-medium text-gray-900">Omat tulokset</p>
                </a>
                
                <a
                  href="/photos"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📸</div>
                  <p className="font-medium text-gray-900">Omat kuvat</p>
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-8 space-y-4">
              <button
                onClick={() => router.push("/party")}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Takaisin etusivulle
              </button>
              
              <button
                onClick={() => {
                  sessionStorage.removeItem("user");
                  router.push("/");
                }}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors block"
              >
                Kirjaudu ulos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}