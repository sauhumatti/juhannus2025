import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all Mölkky games
export async function GET() {
  try {
    const games = await prisma.molkkyGame.findMany({
      include: {
        creator: true,
        winner: true,
        players: {
          include: {
            user: true
          },
          orderBy: {
            currentScore: 'desc'
          }
        },
        _count: {
          select: {
            throws: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Virhe Mölkky-pelien haussa:', error);
    return NextResponse.json(
      { error: 'Virhe pelien haussa' },
      { status: 500 }
    );
  }
}

// Create new Mölkky game
export async function POST(req: Request) {
  try {
    const { creatorId } = await req.json();

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Pelin luoja vaaditaan' },
        { status: 400 }
      );
    }

    const game = await prisma.molkkyGame.create({
      data: {
        creatorId,
        players: {
          create: {
            userId: creatorId
          }
        }
      },
      include: {
        creator: true,
        players: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Virhe Mölkky-pelin luonnissa:', error);
    return NextResponse.json(
      { error: 'Virhe pelin luonnissa' },
      { status: 500 }
    );
  }
}