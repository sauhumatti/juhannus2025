"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
}

interface Question {
  number: number;
  text: string;
}

interface Card {
  dbId: string; // Changed from id to dbId
  cardId: number;
  title: string;
  subtitle: string;
  questions: Question[];
  answers: Record<number, User>;
}

export default function Icebreaker() {
  const [user, setUser] = useState<User | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isGameEnabled, setIsGameEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        router.push("/signin");
        return;
      }
      
      setUser(JSON.parse(storedUser));
      
      // Check if game is enabled
      try {
        const response = await fetch("/api/admin/game-state");
        const data = await response.json();
        setIsGameEnabled(data.isIcebreakerEnabled);
      } catch (err) {
        console.error("Error checking game status:", err);
        setError("Failed to check game status");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch user's card
        const cardRes = await fetch(`/api/icebreaker/card?userId=${user.id}`);
        if (!cardRes.ok) throw new Error("Failed to fetch card");
        const cardData = await cardRes.json();
        setCard(cardData);

        // Fetch participants
        const participantsRes = await fetch("/api/icebreaker/answers");
        if (!participantsRes.ok) throw new Error("Failed to fetch participants");
        const participantsData = await participantsRes.json();
        setParticipants(participantsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading game data");
      }
    };

    fetchData();
  }, [user]);

  // Get available participants for the current question
  const availableParticipants = useMemo(() => {
    if (!card || !participants) return [];

    // Initialize empty answers object if not present
    const answers = card.answers || {};

    // Get all user IDs that have been used in answers
    const usedParticipantIds = Object.values(answers).map((p: User) => p.id);

    // Filter out the current user and already used participants
    return participants.filter((p: User) => 
      p.id !== user?.id && !usedParticipantIds.includes(p.id)
    );
  }, [card, participants, user]);

  const handleSubmitAnswer = async (questionNumber: number) => {
    if (!user || !card || !selectedParticipant) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/icebreaker/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: card.dbId, // Now using dbId instead of id
          questionNumber,
          giverId: user.id,
          receiverId: selectedParticipant,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit answer");
      }

      // Refetch card data to update answers
      const cardRes = await fetch(`/api/icebreaker/card?userId=${user.id}`);
      if (!cardRes.ok) throw new Error("Failed to fetch updated card");
      const cardData = await cardRes.json();
      setCard(cardData);

      // Reset selection
      setSelectedParticipant("");
      setActiveQuestion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Ladataan...</div>
      </div>
    );
  }

  if (!isGameEnabled) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Peli ei ole vielä alkanut</h2>
          <p className="text-gray-600">Odota järjestäjän ilmoitusta pelin alkamisesta.</p>
        </div>
      </div>
    );
  }

  if (!user || !card) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Ladataan...</div>
      </div>
    );
  }

  const answeredQuestionsCount = Object.keys(card.answers || {}).length;
  const totalQuestions = card.questions.length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mt-4 sm:mt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{card.title}</h1>
          <p className="text-gray-600 mb-4 sm:mb-6">{card.subtitle}</p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800">
              Löydetty {answeredQuestionsCount}/{totalQuestions} henkilöä
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Jokaiseen kysymykseen tarvitaan eri henkilö!
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {card.questions.map((question) => (
              <div
                key={question.number}
                className={`p-4 rounded-lg border ${
                  card.answers?.[question.number]
                    ? "bg-green-50 border-green-200"
                    : activeQuestion === question.number
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <p className="text-base sm:text-lg flex-1">
                    {question.number}. {question.text}
                  </p>
                  {card.answers?.[question.number] ? (
                    <div className="flex items-center space-x-2 self-end sm:self-start">
                      <div className="relative w-8 h-8 sm:w-6 sm:h-6 rounded-full overflow-hidden">
                        <Image
                          src={card.answers[question.number].photoUrl}
                          alt={card.answers[question.number].name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-green-700">
                        {card.answers[question.number].name}
                      </span>
                    </div>
                  ) : activeQuestion === question.number ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch">
                      <select
                        value={selectedParticipant}
                        onChange={(e) => setSelectedParticipant(e.target.value)}
                        className={`p-2 sm:p-1 border rounded text-base sm:text-sm min-w-[200px] ${
                          availableParticipants.length === 0 ? "bg-gray-100" : ""
                        }`}
                        disabled={availableParticipants.length === 0}
                      >
                        <option value="">
                          {availableParticipants.length === 0 
                            ? "Ei vapaita henkilöitä" 
                            : "Valitse henkilö"}
                        </option>
                        {availableParticipants.map((participant) => (
                          <option key={participant.id} value={participant.id}>
                            {participant.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitAnswer(question.number)}
                          disabled={!selectedParticipant || isSubmitting || availableParticipants.length === 0}
                          className="flex-1 sm:flex-none px-4 py-2 sm:py-1 bg-green-600 text-white rounded-lg sm:rounded hover:bg-green-700 disabled:opacity-50 text-base sm:text-sm"
                        >
                          {isSubmitting ? "..." : "Tallenna"}
                        </button>
                        <button
                          onClick={() => {
                            setActiveQuestion(null);
                            setSelectedParticipant("");
                          }}
                          className="flex-1 sm:flex-none px-4 py-2 sm:py-1 bg-gray-100 text-gray-700 rounded-lg sm:rounded hover:bg-gray-200 text-base sm:text-sm"
                        >
                          Peru
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveQuestion(question.number)}
                      disabled={availableParticipants.length === 0}
                      className="w-full sm:w-auto px-4 py-2 sm:py-1 bg-blue-600 text-white rounded-lg sm:rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                    >
                      {availableParticipants.length === 0 
                        ? "Ei vapaita henkilöitä" 
                        : "Valitse henkilö"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}