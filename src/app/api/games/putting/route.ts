import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get leaderboard
export async function GET() {
  try {
    const scores = await prisma.puttingScore.findMany({
      include: {
        user: {
          select: {
            name: true,
            username: true,
            photoUrl: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      },
      take: 10 // Top 10 scores
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching putting scores:', error);
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

    if (typeof score !== 'number' || score < 0 || score > 10) {
      return NextResponse.json(
        { error: 'Invalid score. Must be between 0 and 10.' },
        { status: 400 }
      );
    }

    const puttingScore = await prisma.puttingScore.create({
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

    return NextResponse.json(puttingScore);
  } catch (error) {
    console.error('Error creating putting score:', error);
    return NextResponse.json(
      { error: 'Error saving score' },
      { status: 500 }
    );
  }
}