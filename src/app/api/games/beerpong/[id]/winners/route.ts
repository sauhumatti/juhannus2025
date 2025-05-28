import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Player {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { winnerIds } = await req.json();
    const matchId = params.id;

    if (!winnerIds?.length) {
      return NextResponse.json(
        { error: 'Voittajat täytyy valita' },
        { status: 400 }
      );
    }

    // Get the match to verify winners are from participating teams
    const match = await prisma.beerPongMatch.findUnique({
      where: { id: matchId },
      include: {
        team1Players: true,
        team2Players: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Peliä ei löydy' },
        { status: 404 }
      );
    }

    // Verify winners are from the match
    const allPlayerIds = [
      ...match.team1Players.map((p: Player) => p.id),
      ...match.team2Players.map((p: Player) => p.id)
    ];
    
    const invalidWinners = winnerIds.filter((id: string) => !allPlayerIds.includes(id));
    
    if (invalidWinners.length > 0) {
      return NextResponse.json(
        { error: 'Virheellisiä voittajia' },
        { status: 400 }
      );
    }

    // Update match with winners
    const updatedMatch = await prisma.beerPongMatch.update({
      where: { id: matchId },
      data: {
        status: 'completed',
        winners: {
          connect: winnerIds.map((id: string) => ({ id })),
        },
      },
      include: {
        team1Players: true,
        team2Players: true,
        winners: true,
      },
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Virhe voittajien tallennuksessa:', error);
    return NextResponse.json(
      { error: 'Virhe voittajien tallennuksessa' },
      { status: 500 }
    );
  }
}