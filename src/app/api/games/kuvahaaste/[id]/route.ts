import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get a specific challenge with all its responses
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const challenge = await prisma.photoChallenge.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            photoUrl: true
          }
        },
        responses: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                photoUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            responses: {
              where: { isApproved: true }
            }
          }
        }
      }
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Haastetta ei löydy' },
        { status: 404 }
      );
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Virhe haasteen haussa:', error);
    return NextResponse.json(
      { error: 'Virhe haasteen haussa' },
      { status: 500 }
    );
  }
}

// Update challenge (admin only - toggle active status)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isActive, adminUserId } = await req.json();

    // Simple admin check - in a real app you'd verify JWT token
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId }
    });

    if (!adminUser || adminUser.username !== 'admin') {
      return NextResponse.json(
        { error: 'Ei oikeuksia' },
        { status: 403 }
      );
    }

    const challenge = await prisma.photoChallenge.update({
      where: { id },
      data: { isActive },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            photoUrl: true
          }
        },
        _count: {
          select: {
            responses: {
              where: { isApproved: true }
            }
          }
        }
      }
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Virhe haasteen päivittämisessä:', error);
    return NextResponse.json(
      { error: 'Virhe haasteen päivittämisessä' },
      { status: 500 }
    );
  }
}

// Delete challenge (creator or admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    // Get the challenge to check ownership
    const challenge = await prisma.photoChallenge.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Haastetta ei löydy' },
        { status: 404 }
      );
    }

    // Check if user is creator or admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Käyttäjää ei löydy' },
        { status: 404 }
      );
    }

    const isCreator = challenge.creatorId === userId;
    const isAdmin = user.username === 'admin';

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Ei oikeuksia poistaa tätä haastetta' },
        { status: 403 }
      );
    }

    // Delete all responses first (due to foreign key constraint)
    await prisma.photoChallengeResponse.deleteMany({
      where: { challengeId: id }
    });

    // Then delete the challenge
    await prisma.photoChallenge.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Virhe haasteen poistossa:', error);
    return NextResponse.json(
      { error: 'Virhe haasteen poistossa' },
      { status: 500 }
    );
  }
}