import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Add throw to Mölkky game
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { playerId, pinsHit, pinNumber } = await req.json();

    if (!playerId || pinsHit === undefined) {
      return NextResponse.json(
        { error: 'Pelaajan tunnus ja kaadotujen keilojen määrä vaaditaan' },
        { status: 400 }
      );
    }

    // Get game and player data
    const game = await prisma.molkkyGame.findUnique({
      where: { id: id },
      include: {
        players: true,
        throws: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Peliä ei löytynyt' },
        { status: 404 }
      );
    }

    if (game.status !== 'ongoing') {
      return NextResponse.json(
        { error: 'Peli ei ole käynnissä' },
        { status: 400 }
      );
    }

    const player = await prisma.molkkyPlayer.findUnique({
      where: { id: playerId },
      include: { throws: { orderBy: { createdAt: 'desc' }, take: 3 } }
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Pelaajaa ei löytynyt' },
        { status: 404 }
      );
    }

    if (player.isEliminated) {
      return NextResponse.json(
        { error: 'Pelaaja on eliminoitu' },
        { status: 400 }
      );
    }

    // Calculate points based on Mölkky rules
    let points = 0;
    let isMiss = false;
    
    if (pinsHit === 0) {
      points = 0;
      isMiss = true;
    } else if (pinsHit === 1) {
      points = pinNumber || 0;
    } else {
      points = pinsHit;
    }

    const scoreBefore = player.currentScore;
    let scoreAfter = scoreBefore + points;
    let isPenalty = false;

    // Check if score exceeds 50 (penalty: reset to 25)
    if (scoreAfter > 50) {
      scoreAfter = 25;
      isPenalty = true;
    }

    // Calculate new miss count
    let newMissCount = player.missCount;
    if (isMiss) {
      newMissCount = Math.min(newMissCount + 1, 3);
    } else {
      newMissCount = 0;
    }

    // Check if player should be eliminated (3 consecutive misses)
    const isEliminated = newMissCount >= 3;

    // Get throw number
    const throwNumber = (game.throws[0]?.throwNumber || 0) + 1;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create throw record
      const molkkyThrow = await tx.molkkyThrow.create({
        data: {
          gameId: id,
          playerId,
          throwNumber,
          pinsHit,
          pinNumber: pinsHit === 1 ? pinNumber : null,
          points,
          scoreBefore,
          scoreAfter,
          isMiss,
          isPenalty
        },
        include: {
          player: {
            include: {
              user: true
            }
          }
        }
      });

      // Update player
      await tx.molkkyPlayer.update({
        where: { id: playerId },
        data: {
          currentScore: scoreAfter,
          missCount: newMissCount,
          isEliminated
        }
      });

      // Check if game is won (score exactly 50)
      if (scoreAfter === 50) {
        await tx.molkkyGame.update({
          where: { id: id },
          data: {
            status: 'completed',
            winnerId: player.userId,
            endedAt: new Date()
          }
        });
      }

      return molkkyThrow;
    });

    // Get updated game state
    const updatedGame = await prisma.molkkyGame.findUnique({
      where: { id: id },
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
        }
      }
    });

    return NextResponse.json({
      throw: result,
      game: updatedGame,
      isGameWon: scoreAfter === 50,
      isPlayerEliminated: isEliminated
    });
  } catch (error) {
    console.error('Virhe heiton lisäämisessä:', error);
    return NextResponse.json(
      { error: 'Virhe heiton lisäämisessä' },
      { status: 500 }
    );
  }
}