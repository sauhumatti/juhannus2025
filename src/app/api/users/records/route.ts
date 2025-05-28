import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Käyttäjän ID vaaditaan' },
        { status: 400 }
      );
    }

    const [dartScores, puttingScores, beerScores] = await Promise.all([
      prisma.dartScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.puttingScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.beerScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      dartScores,
      puttingScores,
      beerScores,
    });
  } catch (error) {
    console.error('Virhe tulosten haussa:', error);
    return NextResponse.json(
      { error: 'Virhe tulosten haussa' },
      { status: 500 }
    );
  }
}