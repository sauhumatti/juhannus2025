import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('X-User-Id');
    const { score } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Käyttäjän tunnistus vaaditaan' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Virheellinen pisteetä' },
        { status: 400 }
      );
    }

    // Save the memory game score
    const memoryScore = await prisma.memoryScore.create({
      data: {
        userId,
        score,
      },
    });

    return NextResponse.json(memoryScore);
  } catch (error) {
    console.error('Virhe muistipelin tulosten tallennuksessa:', error);
    return NextResponse.json(
      { error: 'Virhe tulosten tallennuksessa' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const scores = await prisma.memoryScore.findMany({
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
        score: 'desc',
      },
      take: 10,
    });

    // Transform to match leaderboard format
    const leaderboard = scores.map(score => ({
      id: score.id,
      score: score.score,
      user: score.user,
      createdAt: score.createdAt.toISOString(),
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Virhe muistipelin tuloslistauksen haussa:', error);
    return NextResponse.json(
      { error: 'Virhe tuloslistauksen haussa' },
      { status: 500 }
    );
  }
}