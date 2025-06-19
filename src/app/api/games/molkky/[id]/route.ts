import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get specific Mölkky game
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const game = await prisma.molkkyGame.findUnique({
      where: { id },
      include: {
        creator: true,
        winner: true,
        players: {
          include: {
            user: true,
            throws: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        throws: {
          include: {
            player: {
              include: {
                user: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Peliä ei löytynyt' },
        { status: 404 }
      );
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Virhe Mölkky-pelin haussa:', error);
    return NextResponse.json(
      { error: 'Virhe pelin haussa' },
      { status: 500 }
    );
  }
}

// Update Mölkky game
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, winnerId } = await req.json();

    const updateData: { status?: string; startedAt?: Date; endedAt?: Date; winnerId?: string } = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'ongoing' && !await prisma.molkkyGame.findFirst({ where: { id, startedAt: { not: null } } })) {
        updateData.startedAt = new Date();
      }
      if (status === 'completed') {
        updateData.endedAt = new Date();
        if (winnerId) {
          updateData.winnerId = winnerId;
        }
      }
    }

    const game = await prisma.molkkyGame.update({
      where: { id },
      data: updateData,
      include: {
        creator: true,
        winner: true,
        players: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Virhe Mölkky-pelin päivityksessä:', error);
    return NextResponse.json(
      { error: 'Virhe pelin päivityksessä' },
      { status: 500 }
    );
  }
}

// Delete Mölkky game
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.molkkyGame.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Virhe Mölkky-pelin poistossa:', error);
    return NextResponse.json(
      { error: 'Virhe pelin poistossa' },
      { status: 500 }
    );
  }
}