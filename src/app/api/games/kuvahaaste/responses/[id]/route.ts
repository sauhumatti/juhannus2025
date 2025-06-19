import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update response (approve/reject)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isApproved, adminUserId } = await req.json();

    // Simple admin check
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId }
    });

    if (!adminUser || adminUser.username !== 'admin') {
      return NextResponse.json(
        { error: 'Ei oikeuksia' },
        { status: 403 }
      );
    }

    const response = await prisma.photoChallengeResponse.update({
      where: { id },
      data: { isApproved },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            photoUrl: true
          }
        },
        challenge: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Virhe vastauksen päivittämisessä:', error);
    return NextResponse.json(
      { error: 'Virhe vastauksen päivittämisessä' },
      { status: 500 }
    );
  }
}

// Delete response (creator or admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    // Get the response to check ownership
    const response = await prisma.photoChallengeResponse.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!response) {
      return NextResponse.json(
        { error: 'Vastausta ei löydy' },
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

    const isCreator = response.creatorId === userId;
    const isAdmin = user.username === 'admin';

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Ei oikeuksia poistaa tätä vastausta' },
        { status: 403 }
      );
    }

    await prisma.photoChallengeResponse.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Virhe vastauksen poistossa:', error);
    return NextResponse.json(
      { error: 'Virhe vastauksen poistossa' },
      { status: 500 }
    );
  }
}