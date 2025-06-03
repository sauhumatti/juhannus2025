import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get leaderboard
export async function GET() {
  try {
    // Get the best score for each user
    const bestScores = await prisma.dartScore.groupBy({
      by: ['userId'],
      _max: {
        score: true,
      },
    });

    // Get the full score details for each user's best score
    const scores = await Promise.all(
      bestScores.map(async (best) => {
        const score = await prisma.dartScore.findFirst({
          where: {
            userId: best.userId,
            score: best._max.score!,
          },
          include: {
            user: {
              select: {
                name: true,
                username: true,
                photoUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc', // If same score, get the most recent
          },
        });
        return score;
      })
    );

    // Filter out nulls and sort by score (descending)
    const sortedScores = scores
      .filter((score) => score !== null)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 10); // Top 10

    return NextResponse.json(sortedScores);
  } catch (error) {
    console.error('Error fetching dart scores:', error);
    return NextResponse.json(
      { error: 'Error fetching scores' },
      { status: 500 }
    );
  }
}

// Submit new score
export async function POST(req: Request) {
  try {
    const { score, userId } = await req.json();

    if (typeof score !== 'number' || score < 0 || score > 50) {
      return NextResponse.json(
        { error: 'Invalid score. Must be between 0 and 50.' },
        { status: 400 }
      );
    }

    // Check if this is a personal best
    const previousBest = await prisma.dartScore.findFirst({
      where: { userId },
      orderBy: { score: 'desc' },
    });

    const isPersonalBest = !previousBest || score > previousBest.score;

    // Create the score
    const dartScore = await prisma.dartScore.create({
      data: {
        score,
        userId
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            photoUrl: true
          }
        }
      }
    });

    // If it's a personal best, create a feed post
    if (isPersonalBest) {
      // Get all scores to determine position
      const allBestScores = await prisma.dartScore.groupBy({
        by: ['userId'],
        _max: { score: true },
      });

      const sortedScores = allBestScores
        .sort((a, b) => b._max.score! - a._max.score!);

      const position = sortedScores.findIndex(s => s.userId === userId) + 1;

      // Create a "photo" moment for the feed
      await prisma.photoMoment.create({
        data: {
          userId,
          photoUrl: 'highscore', // Special marker for high score posts
          caption: `🎯 Uusi henkilökohtainen ennätys! Tikanheitto: ${score}/50 pistettä - Sija #${position} tulostaululla!`
        }
      });
    }

    return NextResponse.json(dartScore);
  } catch (error) {
    console.error('Error creating dart score:', error);
    return NextResponse.json(
      { error: 'Error saving score' },
      { status: 500 }
    );
  }
}