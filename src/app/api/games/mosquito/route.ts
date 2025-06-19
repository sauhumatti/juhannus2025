import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      const topScores = await prisma.mosquitoScore.findMany({
        include: {
          user: {
            select: { id: true, name: true, username: true, photoUrl: true }
          }
        },
        orderBy: { score: 'desc' },
        take: 10
      });

      return NextResponse.json(topScores);
    }

    const userScores = await prisma.mosquitoScore.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const bestScore = await prisma.mosquitoScore.findFirst({
      where: { userId },
      orderBy: { score: 'desc' }
    });

    return NextResponse.json({
      recentScores: userScores,
      bestScore: bestScore?.score || 0
    });
  } catch (error) {
    console.error('Error fetching mosquito scores:', error);
    return NextResponse.json(
      { error: 'Virhe pisteiden hakemisessa' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score } = body;
    
    const userId = request.headers.get('X-User-Id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Kirjaudu sisään tallentaaksesi pisteet' },
        { status: 401 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Virheelliset pisteet' },
        { status: 400 }
      );
    }

    const mosquitoScore = await prisma.mosquitoScore.create({
      data: {
        score,
        userId
      }
    });

    return NextResponse.json(mosquitoScore);
  } catch (error) {
    console.error('Error saving mosquito score:', error);
    return NextResponse.json(
      { error: 'Virhe pisteiden tallentamisessa' },
      { status: 500 }
    );
  }
}