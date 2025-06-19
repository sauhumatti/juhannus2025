'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  photoUrl: string;
}

interface PhotoChallengeResponse {
  id: string;
  imageUrl: string;
  comment?: string;
  createdAt: string;
  isApproved: boolean;
  creator: User;
}

interface PhotoChallenge {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
  isActive: boolean;
  creator: User;
  responses: PhotoChallengeResponse[];
  _count: {
    responses: number;
  };
}

export default function KuvahaasteGame() {
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<PhotoChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [responseImage, setResponseImage] = useState<File | null>(null);
  const [responseComment, setResponseComment] = useState('');
  const [responsePreview, setResponsePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const responseFileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = sessionStorage.getItem('user');
      if (!storedUser) {
        router.push('/signin');
        return;
      }
      setUser(JSON.parse(storedUser));
      fetchChallenges();
    };

    checkAuth();
  }, [router]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/games/kuvahaaste');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      }
    } catch (error) {
      console.error('Virhe haasteiden haussa:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
    formData.append('folder', 'kuvahaaste');

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleResponseFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResponseImage(file);
      const url = URL.createObjectURL(file);
      setResponsePreview(url);
    }
  };

  const createChallenge = async () => {
    if (!selectedFile || !newChallenge.title || !user) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(selectedFile);
      
      const response = await fetch('/api/games/kuvahaaste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newChallenge,
          imageUrl,
          creatorId: user.id
        })
      });

      if (response.ok) {
        await fetchChallenges();
        setShowCreateForm(false);
        setNewChallenge({ title: '', description: '', imageUrl: '' });
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }
    } catch (error) {
      console.error('Virhe haasteen luomisessa:', error);
    } finally {
      setUploading(false);
    }
  };

  const submitResponse = async (challengeId: string) => {
    if (!responseImage || !user) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(responseImage);
      
      const response = await fetch(`/api/games/kuvahaaste/${challengeId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          comment: responseComment,
          creatorId: user.id
        })
      });

      if (response.ok) {
        await fetchChallenges();
        setSelectedChallenge(null);
        setResponseImage(null);
        setResponseComment('');
        if (responsePreview) {
          URL.revokeObjectURL(responsePreview);
          setResponsePreview(null);
        }
      }
    } catch (error) {
      console.error('Virhe vastauksen lähettämisessä:', error);
    } finally {
      setUploading(false);
    }
  };

  const getUserResponseForChallenge = (challenge: PhotoChallenge) => {
    return challenge.responses.find(response => response.creator.id === user?.id);
  };

  const deleteChallenge = async (challengeId: string) => {
    if (!user || deleting) return;
    
    const confirmDelete = window.confirm('Haluatko varmasti poistaa tämän haasteen? Kaikki vastaukset poistetaan myös.');
    if (!confirmDelete) return;

    setDeleting(challengeId);
    try {
      const response = await fetch(`/api/games/kuvahaaste/${challengeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        await fetchChallenges();
      } else {
        const data = await response.json();
        alert(data.error || 'Virhe haasteen poistossa');
      }
    } catch (error) {
      console.error('Virhe haasteen poistossa:', error);
      alert('Virhe haasteen poistossa');
    } finally {
      setDeleting(null);
    }
  };

  const deleteResponse = async (responseId: string) => {
    if (!user || deleting) return;
    
    const confirmDelete = window.confirm('Haluatko varmasti poistaa vastauksesi?');
    if (!confirmDelete) return;

    setDeleting(responseId);
    try {
      const response = await fetch(`/api/games/kuvahaaste/responses/${responseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        await fetchChallenges();
      } else {
        const data = await response.json();
        alert(data.error || 'Virhe vastauksen poistossa');
      }
    } catch (error) {
      console.error('Virhe vastauksen poistossa:', error);
      alert('Virhe vastauksen poistossa');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0FFF0' }}>
        <div className="text-center">
          <div className="text-xl" style={{ fontFamily: 'Nunito, sans-serif', color: '#228B22' }}>
            Ladataan kuvahaasteet...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0FFF0' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              color: '#228B22'
            }}
          >
            📸 Kuvahaaste
          </h1>
          <p 
            className="text-lg mb-6"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#2F4F4F'
            }}
          >
            Löydä mielenkiintoisia kohteita ja haasta muut löytämään samat!
          </p>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: '#228B22',
              color: '#F0FFF0',
              fontFamily: 'Nunito, sans-serif'
            }}
          >
            🎯 Luo uusi haaste
          </button>
        </div>

        {/* Create Challenge Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                Luo uusi kuvahaaste
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                    Haasteen otsikko *
                  </label>
                  <input
                    type="text"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                    placeholder="Esim. Löydä punainen ovi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                    Kuvaus (valinnainen)
                  </label>
                  <textarea
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                    placeholder="Lisätietoja haasteesta..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                    Esimerkkikuva *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    📷 Valitse kuva
                  </button>
                  
                  {previewUrl && (
                    <div className="mt-4">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewChallenge({ title: '', description: '', imageUrl: '' });
                    setSelectedFile(null);
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Peruuta
                </button>
                <button
                  onClick={createChallenge}
                  disabled={!selectedFile || !newChallenge.title || uploading}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: '#228B22',
                    fontFamily: 'Nunito, sans-serif'
                  }}
                >
                  {uploading ? 'Luodaan...' : 'Luo haaste'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Response Form */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ 
                  fontFamily: 'Fredoka One, cursive',
                  color: '#228B22'
                }}
              >
                Vastaa haasteeseen
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                    Löytämäsi kuva *
                  </label>
                  <input
                    ref={responseFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleResponseFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => responseFileInputRef.current?.click()}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    📷 Valitse kuva
                  </button>
                  
                  {responsePreview && (
                    <div className="mt-4">
                      <Image
                        src={responsePreview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover mx-auto"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                    Kommentti (valinnainen)
                  </label>
                  <textarea
                    value={responseComment}
                    onChange={(e) => setResponseComment(e.target.value)}
                    placeholder="Kerro missä löysit tämän..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedChallenge(null);
                    setResponseImage(null);
                    setResponseComment('');
                    if (responsePreview) {
                      URL.revokeObjectURL(responsePreview);
                      setResponsePreview(null);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Peruuta
                </button>
                <button
                  onClick={() => submitResponse(selectedChallenge)}
                  disabled={!responseImage || uploading}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: '#228B22',
                    fontFamily: 'Nunito, sans-serif'
                  }}
                >
                  {uploading ? 'Lähetetään...' : 'Lähetä vastaus'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => {
            const userResponse = getUserResponseForChallenge(challenge);
            
            return (
              <div
                key={challenge.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-transform hover:scale-105"
                style={{ borderColor: '#32CD32' }}
              >
                {/* Challenge Image */}
                <div className="relative h-64 w-full">
                  <Image
                    src={challenge.imageUrl}
                    alt={challenge.title}
                    fill
                    className="object-contain bg-gray-100"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {challenge._count.responses} vastausta
                  </div>
                </div>

                {/* Challenge Info */}
                <div className="p-4">
                  <h3 
                    className="text-lg font-bold mb-2"
                    style={{ 
                      fontFamily: 'Fredoka One, cursive',
                      color: '#228B22'
                    }}
                  >
                    {challenge.title}
                  </h3>
                  
                  {challenge.description && (
                    <p 
                      className="text-sm mb-3 text-gray-600"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {challenge.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src={challenge.creator.photoUrl}
                        alt={challenge.creator.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span 
                        className="text-sm text-gray-600"
                        style={{ fontFamily: 'Nunito, sans-serif' }}
                      >
                        {challenge.creator.name}
                      </span>
                    </div>
                    
                    {/* Delete button for challenge creator */}
                    {challenge.creator.id === user?.id && (
                      <button
                        onClick={() => deleteChallenge(challenge.id)}
                        disabled={deleting === challenge.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        title="Poista haaste"
                      >
                        {deleting === challenge.id ? '...' : '🗑️'}
                      </button>
                    )}
                  </div>

                  {/* Response Status */}
                  {userResponse ? (
                    <div className="space-y-2">
                      <div className="text-center py-2 px-4 rounded-lg bg-green-100 text-green-800 text-sm font-semibold">
                        ✅ Vastasit tähän haasteeseen!
                      </div>
                      <div className="text-center">
                        <button
                          onClick={() => deleteResponse(userResponse.id)}
                          disabled={deleting === userResponse.id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                        >
                          {deleting === userResponse.id ? 'Poistetaan...' : '🗑️ Poista vastaukseni'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedChallenge(challenge.id)}
                      className="w-full py-2 px-4 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: '#228B22',
                        fontFamily: 'Nunito, sans-serif'
                      }}
                    >
                      🎯 Vastaa haasteeseen
                    </button>
                  )}

                  {/* Recent Responses */}
                  {challenge.responses.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2" style={{ color: '#2F4F4F' }}>
                        Viimeisimmät vastaukset:
                      </h4>
                      <div className="flex gap-2 overflow-x-auto">
                        {challenge.responses.slice(0, 3).map((response) => (
                          <div key={response.id} className="flex-shrink-0">
                            <Image
                              src={response.imageUrl}
                              alt="Vastaus"
                              width={60}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {challenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h3 
              className="text-2xl font-bold mb-2"
              style={{ 
                fontFamily: 'Fredoka One, cursive',
                color: '#228B22'
              }}
            >
              Ei vielä haasteita
            </h3>
            <p 
              className="text-lg text-gray-600 mb-6"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Ole ensimmäinen ja luo jännittävä kuvahaaste!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}