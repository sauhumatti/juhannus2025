import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all matches
export async function GET() {
  try {
    const matches = await prisma.beerPongMatch.findMany({
      include: {
        team1Players: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
        team2Players: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
        winners: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Virhe pelien haussa:', error);
    return NextResponse.json(
      { error: 'Virhe pelien haussa' },
      { status: 500 }
    );
  }
}

// Create new match
export async function POST(req: Request) {
  try {
    const { team1PlayerIds, team2PlayerIds, team1Name, team2Name } = await req.json();

    // Validate teams
    if (!team1PlayerIds?.length || !team2PlayerIds?.length) {
      return NextResponse.json(
        { error: 'Molemmissa joukkueissa tulee olla pelaajia' },
        { status: 400 }
      );
    }

    if (team1PlayerIds.length > 2 || team2PlayerIds.length > 2) {
      return NextResponse.json(
        { error: 'Joukkueessa voi olla korkeintaan 2 pelaajaa' },
        { status: 400 }
      );
    }

    // Create match
    const match = await prisma.beerPongMatch.create({
      data: {
        team1Players: {
          connect: team1PlayerIds.map((id: string) => ({ id })),
        },
        team2Players: {
          connect: team2PlayerIds.map((id: string) => ({ id })),
        },
        team1Name,
        team2Name,
      },
      include: {
        team1Players: true,
        team2Players: true,
      },
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error('Virhe pelin luonnissa:', error);
    return NextResponse.json(
      { error: 'Virhe pelin luonnissa' },
      { status: 500 }
    );
  }
}