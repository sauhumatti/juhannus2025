import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all photo challenges
export async function GET() {
  try {
    const challenges = await prisma.photoChallenge.findMany({
      where: { isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            photoUrl: true
          }
        },
        responses: {
          where: { isApproved: true },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Virhe haasteiden haussa:', error);
    return NextResponse.json(
      { error: 'Virhe haasteiden haussa' },
      { status: 500 }
    );
  }
}

// Create a new photo challenge
export async function POST(req: Request) {
  try {
    const { title, description, imageUrl, creatorId } = await req.json();

    if (!title || !imageUrl || !creatorId) {
      return NextResponse.json(
        { error: 'Otsikko, kuva ja tekijän tunnus vaaditaan' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: creatorId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Käyttäjää ei löydy' },
        { status: 404 }
      );
    }

    const challenge = await prisma.photoChallenge.create({
      data: {
        title,
        description,
        imageUrl,
        creatorId
      },
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
    console.error('Virhe haasteen luomisessa:', error);
    return NextResponse.json(
      { error: 'Virhe haasteen luomisessa' },
      { status: 500 }
    );
  }
}