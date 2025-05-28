import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get leaderboard
export async function GET() {
  try {
    const scores = await prisma.beerScore.findMany({
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
        time: 'asc' // Fastest times first
      },
      take: 10 // Top 10 scores
    });

    return NextResponse.json(scores);
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

    return NextResponse.json(beerScore);
  } catch (error) {
    console.error('Error creating beer score:', error);
    return NextResponse.json(
      { error: 'Error saving score' },
      { status: 500 }
    );
  }
}