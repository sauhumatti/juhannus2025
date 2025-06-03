import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all photo moments in chronological order
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeHighscores = searchParams.get('includeHighscores') === 'true';

    const whereClause = includeHighscores ? {} : {
      photoUrl: {
        not: 'highscore' // Exclude highscore posts from photos page by default
      }
    };

    const photos = await prisma.photoMoment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Virhe kuvien haussa:', error);
    
    // If table doesn't exist, return empty array instead of error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
      console.log('PhotoMoment table does not exist yet, returning empty array');
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Virhe kuvien haussa' },
      { status: 500 }
    );
  }
}

// Create a new photo moment
export async function POST(req: Request) {
  try {
    const { userId, photoUrl, caption } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Käyttäjätunnus puuttuu' },
        { status: 400 }
      );
    }

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Kuvan URL puuttuu' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Käyttäjää ei löytynyt' },
        { status: 404 }
      );
    }

    const photoMoment = await prisma.photoMoment.create({
      data: {
        userId,
        photoUrl,
        caption: caption || null,
      },
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

    return NextResponse.json(photoMoment, { status: 201 });
  } catch (error) {
    console.error('Virhe kuvan tallennuksessa:', error);
    return NextResponse.json(
      { error: 'Virhe kuvan tallennuksessa' },
      { status: 500 }
    );
  }
}