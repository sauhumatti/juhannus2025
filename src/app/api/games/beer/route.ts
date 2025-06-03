import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get leaderboard
export async function GET() {
  try {
    // Get the best score for each user
    const bestScores = await prisma.beerScore.groupBy({
      by: ['userId'],
      _min: {
        time: true,
      },
    });

    // Get the full score details for each user's best time
    const scores = await Promise.all(
      bestScores.map(async (best) => {
        const score = await prisma.beerScore.findFirst({
          where: {
            userId: best.userId,
            time: best._min.time!,
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
            createdAt: 'desc', // If same time, get the most recent
          },
        });
        return score;
      })
    );

    // Filter out nulls and sort by time
    const sortedScores = scores
      .filter((score) => score !== null)
      .sort((a, b) => a!.time - b!.time)
      .slice(0, 10); // Top 10

    return NextResponse.json(sortedScores);
  } catch (error) {
    console.error('Error fetching beer scores:', error);
    return NextResponse.json(
      { error: 'Error fetching scores' },
      { status: 500 }
    );
  }
}

// Submit new score
export async function POST(req: Request) {
  try {
    const { time, userId } = await req.json();

    if (typeof time !== 'number' || time < 0) {
      return NextResponse.json(
        { error: 'Invalid time. Must be a positive number.' },
        { status: 400 }
      );
    }

    // Check if this is a personal best
    const previousBest = await prisma.beerScore.findFirst({
      where: { userId },
      orderBy: { time: 'asc' },
    });

    const isPersonalBest = !previousBest || time < previousBest.time;

    // Create the score
    const beerScore = await prisma.beerScore.create({
      data: {
        time,
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
      const allBestScores = await prisma.beerScore.groupBy({
        by: ['userId'],
        _min: { time: true },
      });

      const sortedScores = allBestScores
        .sort((a, b) => a._min.time! - b._min.time!);

      const position = sortedScores.findIndex(s => s.userId === userId) + 1;

      // Create a "photo" moment for the feed
      await prisma.photoMoment.create({
        data: {
          userId,
          photoUrl: 'highscore', // Special marker for high score posts
          caption: `🏆 Uusi henkilökohtainen ennätys! Kaljakellotus: ${time.toFixed(2)}s - Sija #${position} tulostaululla!`
        }
      });
    }

    return NextResponse.json(beerScore);
  } catch (error) {
    console.error('Error creating beer score:', error);
    return NextResponse.json(
      { error: 'Error saving score' },
      { status: 500 }
    );
  }
}