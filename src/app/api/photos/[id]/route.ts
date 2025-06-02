import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update photo caption
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { caption } = await req.json();
    const { id: photoId } = await params;

    // Check if photo exists
    const photo = await prisma.photoMoment.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Kuvaa ei löytynyt' },
        { status: 404 }
      );
    }

    // Update the photo
    const updatedPhoto = await prisma.photoMoment.update({
      where: { id: photoId },
      data: { caption },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          }
        }
      }
    });

    return NextResponse.json(updatedPhoto);
  } catch (error) {
    console.error('Virhe kuvan päivityksessä:', error);
    return NextResponse.json(
      { error: 'Virhe kuvan päivityksessä' },
      { status: 500 }
    );
  }
}

// Delete photo
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: photoId } = await params;

    // Check if photo exists
    const photo = await prisma.photoMoment.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Kuvaa ei löytynyt' },
        { status: 404 }
      );
    }

    // Delete the photo
    await prisma.photoMoment.delete({
      where: { id: photoId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Virhe kuvan poistamisessa:', error);
    return NextResponse.json(
      { error: 'Virhe kuvan poistamisessa' },
      { status: 500 }
    );
  }
}