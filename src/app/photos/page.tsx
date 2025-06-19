"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
}

interface PhotoMoment {
  id: string;
  photoUrl: string;
  caption: string | null;
  createdAt: string;
  user: User;
}

export default function PhotosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [photos, setPhotos] = useState<PhotoMoment[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoMoment[]>([]);
  const [showOwnPhotos, setShowOwnPhotos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState("");
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
      
      setUser(JSON.parse(storedUser));
      await fetchPhotos();
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (!response.ok) throw new Error("Failed to fetch photos");
      const data = await response.json();
      setPhotos(data);
      setFilteredPhotos(data);
    } catch (err) {
      console.error("Error fetching photos:", err);
      setError("Virhe kuvien latauksessa");
    }
  };

  // Filter photos when toggle changes
  useEffect(() => {
    if (showOwnPhotos && user) {
      setFilteredPhotos(photos.filter(photo => photo.user.id === user.id));
    } else {
      setFilteredPhotos(photos);
    }
  }, [showOwnPhotos, photos, user]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      uploadPhoto(selectedFile);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCaption("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Get upload signature
      const signatureRes = await fetch("/api/photos/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "party-moments" }),
      });

      if (!signatureRes.ok) {
        const errorData = await signatureRes.text();
        console.error("Signature endpoint error:", errorData);
        throw new Error("Failed to get upload signature");
      }
      
      const signatureData = await signatureRes.json();
      console.log("Signature data received:", signatureData);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", signatureData.upload_preset);
      formData.append("folder", signatureData.folder);
      
      // Only add signed upload params if they exist
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
        const errorText = await uploadRes.text();
        console.error("Cloudinary upload error:", errorText);
        throw new Error("Failed to upload image");
      }
      
      const uploadData = await uploadRes.json();

      // Save to database
      const saveRes = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          photoUrl: uploadData.secure_url,
          caption: caption.trim() || null,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save photo");

      // Refresh photos
      await fetchPhotos();
      setCaption("");
      setSuccess("Kuva ladattu onnistuneesti!");
      
      // Clear file input and preview
      handleCancelUpload();
    } catch (err) {
      console.error("Error uploading photo:", err);
      setError("Virhe kuvan latauksessa");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = (photo: PhotoMoment) => {
    setEditingPhotoId(photo.id);
    setEditingCaption(photo.caption || "");
  };

  const handleSaveEdit = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editingCaption.trim() || null }),
      });

      if (!response.ok) throw new Error("Failed to update photo");

      await fetchPhotos();
      setEditingPhotoId(null);
      setEditingCaption("");
      setSuccess("Kuva päivitetty!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating photo:", err);
      setError("Virhe kuvan päivityksessä");
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Haluatko varmasti poistaa tämän kuvan?")) return;

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete photo");

      await fetchPhotos();
      setSuccess("Kuva poistettu!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting photo:", err);
      setError("Virhe kuvan poistamisessa");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-green-100 p-4 flex items-center justify-center">
        <div className="text-2xl text-green-800">Ladataan...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-green-100 px-4 py-2 sm:p-4 photos-page">
      {/* Forest Header Background */}
      <div 
        className="w-full h-48 mb-8 rounded-xl relative overflow-hidden shadow-lg"
        style={{
          background: `linear-gradient(rgba(34, 139, 34, 0.3), rgba(34, 139, 34, 0.3)), url('/forest.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#228B22'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Fredoka One, cursive' }}>
              Juhannuskuvat
            </h1>
            <p className="text-green-100 text-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Jaa kuvia ja muistoja juhannusviikosta
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border-2 border-green-200">
          {/* Upload Section */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 mb-8 border border-green-300 relative">
            <div className="flex items-center justify-center mb-4">
              <img src="/forest-camera.png" alt="Camera" className="w-8 h-8 mr-3" />
              <h2 className="text-xl font-semibold text-green-800 text-center" style={{ fontFamily: 'Fredoka One, cursive' }}>
                Jaa juhannushetki
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* File selection button */}
              <div className="flex justify-center">
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
                  disabled={uploading || selectedFile !== null}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {selectedFile ? (
                    <>🌲 Kuva valittu</>
                  ) : (
                    <>🌲 Valitse kuva</>
                  )}
                </button>
              </div>

              {/* Preview and caption */}
              {selectedFile && (
                <>
                  {/* Image preview */}
                  {previewUrl && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={previewUrl}
                        alt="Esikatselu"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Caption input */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      🍄 Kerro juhannustarinasi (valinnainen)
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Kuvaile juhannushetkeä..."
                      className="w-full p-3 border border-green-300 rounded-lg resize-none text-gray-900 placeholder:text-green-500 focus:border-green-500 focus:ring-green-500"
                      rows={3}
                      maxLength={300}
                      disabled={uploading}
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    />
                    <p className="text-xs text-green-600 mt-1">{caption.length}/300</p>
                  </div>

                  {/* Submit and cancel buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit}
                      disabled={uploading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Tallentaa muistoja...
                        </>
                      ) : (
                        <>🌿 Jaa juhannuksessa</>
                      )}
                    </button>
                    <button
                      onClick={handleCancelUpload}
                      disabled={uploading}
                      className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      🍂 Peruuta
                    </button>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200" style={{ fontFamily: 'Nunito, sans-serif' }}>
                🚨 {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200" style={{ fontFamily: 'Nunito, sans-serif' }}>
                ✨ {success}
              </div>
            )}
          </div>

          {/* Photos Gallery */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-green-800" style={{ fontFamily: 'Fredoka One, cursive' }}>
                {showOwnPhotos ? `🌲 Omat juhannuskuvat (${filteredPhotos.length})` : `🌲 Juhannuskuvagalleria (${filteredPhotos.length})`}
              </h2>
              
              {/* Toggle buttons */}
              <div className="flex rounded-lg bg-green-100 p-1 border border-green-200">
                <button
                  onClick={() => setShowOwnPhotos(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    !showOwnPhotos 
                      ? "bg-white text-green-800 shadow-sm border border-green-300" 
                      : "text-green-600 hover:text-green-800"
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  🌿 Kaikki kuvat
                </button>
                <button
                  onClick={() => setShowOwnPhotos(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    showOwnPhotos 
                      ? "bg-white text-green-800 shadow-sm border border-green-300" 
                      : "text-green-600 hover:text-green-800"
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  🍄 Omat kuvat
                </button>
              </div>
            </div>

            {filteredPhotos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌲</div>
                <p className="text-green-600 text-lg font-medium" style={{ fontFamily: 'Fredoka One, cursive' }}>
                  {showOwnPhotos ? "Et ole vielä jakanut juhannuskuvia" : "Juhannus odottaa ensimmäistä kuvaajaa"}
                </p>
                <p className="text-green-500 text-sm mt-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {showOwnPhotos ? "🌿 Jaa ensimmäinen juhannushetkesi!" : "🍄 Ole ensimmäinen, joka jakaa juhannusmuiston!"}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    {/* Photo Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={photo.user.photoUrl}
                            alt={photo.user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-green-800" style={{ fontFamily: 'Nunito, sans-serif' }}>{photo.user.name}</p>
                          <p className="text-sm text-green-600" style={{ fontFamily: 'Nunito, sans-serif' }}>{formatDate(photo.createdAt)}</p>
                        </div>
                      </div>
                      {/* Edit/Delete buttons for own photos or admin */}
                      {(user?.id === photo.user.id || user?.username === "admin") && (
                        <div className="flex gap-2">
                          {editingPhotoId !== photo.id && (
                            <>
                              {user?.id === photo.user.id && (
                                <button
                                  onClick={() => handleEdit(photo)}
                                  className="text-green-600 hover:text-green-800 p-2"
                                  title="Muokkaa"
                                >
                                  ✏️
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(photo.id)}
                                className="text-red-600 hover:text-red-800 p-2"
                                title="Poista"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Photo */}
                    <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      <Image
                        src={photo.photoUrl}
                        alt={photo.caption || "Juhlahetki"}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Caption */}
                    {editingPhotoId === photo.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          className="w-full p-2 border border-green-300 rounded-lg resize-none text-gray-900 focus:border-green-500 focus:ring-green-500"
                          rows={3}
                          maxLength={300}
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(photo.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            style={{ fontFamily: 'Nunito, sans-serif' }}
                          >
                            🌿 Tallenna
                          </button>
                          <button
                            onClick={() => {
                              setEditingPhotoId(null);
                              setEditingCaption("");
                            }}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                            style={{ fontFamily: 'Nunito, sans-serif' }}
                          >
                            🍂 Peruuta
                          </button>
                        </div>
                      </div>
                    ) : (
                      photo.caption && <p className="text-green-800" style={{ fontFamily: 'Nunito, sans-serif' }}>{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}