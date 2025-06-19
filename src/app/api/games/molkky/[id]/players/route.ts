import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Add player to Mölkky game
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Käyttäjätunnus vaaditaan' },
        { status: 400 }
      );
    }

    // Check if game exists and is in waiting status
    const game = await prisma.molkkyGame.findUnique({
      where: { id },
      include: { players: true }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Peliä ei löytynyt' },
        { status: 404 }
      );
    }

    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Peliin ei voi enää liittyä' },
        { status: 400 }
      );
    }

    // Check if player already in game
    const existingPlayer = game.players.find(p => p.userId === userId);
    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Pelaaja on jo mukana pelissä' },
        { status: 400 }
      );
    }

    // Add player
    const player = await prisma.molkkyPlayer.create({
      data: {
        gameId: id,
        userId
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error('Virhe pelaajan lisäämisessä:', error);
    return NextResponse.json(
      { error: 'Virhe pelaajan lisäämisessä' },
      { status: 500 }
    );
  }
}

// Remove player from Mölkky game
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    const game = await prisma.molkkyGame.findUnique({
      where: { id }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Peliä ei löytynyt' },
        { status: 404 }
      );
    }

    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Pelaajaa ei voi poistaa käynnissä olevasta pelistä' },
        { status: 400 }
      );
    }

    await prisma.molkkyPlayer.deleteMany({
      where: {
        gameId: id,
        userId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Virhe pelaajan poistossa:', error);
    return NextResponse.json(
      { error: 'Virhe pelaajan poistossa' },
      { status: 500 }
    );
  }
}