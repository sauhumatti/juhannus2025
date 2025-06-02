import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadCards } from '@/lib/icebreaker';

interface LeaderboardEntry {
  userId: string;
  name: string;
  photoUrl: string;
  questionsAnswered: number;
  totalQuestions: number;
  completionPercentage: number;
  cardTitle: string;
}

export async function GET() {
  try {
    // Get all users with their assigned cards and answers
    const usersWithCards = await prisma.user.findMany({
      where: {
        assignedCard: {
          isNot: null
        }
      },
      include: {
        assignedCard: {
          include: {
            answers: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Load card data from JSON
    const cards = await loadCards();

    // Calculate leaderboard entries
    const leaderboardEntries: LeaderboardEntry[] = usersWithCards.map(user => {
      const card = user.assignedCard;
      if (!card) {
        return {
          userId: user.id,
          name: user.name,
          photoUrl: user.photoUrl,
          questionsAnswered: 0,
          totalQuestions: 0,
          completionPercentage: 0,
          cardTitle: 'Ei korttia'
        };
      }

      const cardData = cards.find(c => c.id === card.cardId);
      const totalQuestions = cardData?.questions.length || 0;
      const questionsAnswered = card.answers.length;
      const completionPercentage = totalQuestions > 0 ? Math.round((questionsAnswered / totalQuestions) * 100) : 0;

      return {
        userId: user.id,
        name: user.name,
        photoUrl: user.photoUrl,
        questionsAnswered,
        totalQuestions,
        completionPercentage,
        cardTitle: cardData?.title || 'Tuntematon kortti'
      };
    });

    // Sort by completion percentage (highest first), then by questions answered
    const sortedLeaderboard = leaderboardEntries.sort((a, b) => {
      if (b.completionPercentage !== a.completionPercentage) {
        return b.completionPercentage - a.completionPercentage;
      }
      return b.questionsAnswered - a.questionsAnswered;
    });

    return NextResponse.json(sortedLeaderboard);
  } catch (error) {
    console.error('Virhe tulostaulukon haussa:', error);
    return NextResponse.json(
      { error: 'Virhe tulostaulukon haussa' },
      { status: 500 }
    );
  }
}