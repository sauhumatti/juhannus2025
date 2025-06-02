import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update user profile
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { photoUrl } = await req.json();
    const { id: userId } = await params;

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Kuvan URL puuttuu' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { photoUrl },
      select: {
        id: true,
        username: true,
        name: true,
        photoUrl: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Virhe profiilin päivityksessä:', error);
    return NextResponse.json(
      { error: 'Virhe profiilin päivityksessä' },
      { status: 500 }
    );
  }
}