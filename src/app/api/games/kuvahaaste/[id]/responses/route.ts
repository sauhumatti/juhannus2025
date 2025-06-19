import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Submit a response to a photo challenge
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: challengeId } = await params;
    const { imageUrl, comment, creatorId } = await req.json();

    if (!imageUrl || !creatorId) {
      return NextResponse.json(
        { error: 'Kuva ja tekijän tunnus vaaditaan' },
        { status: 400 }
      );
    }

    // Verify challenge exists and is active
    const challenge = await prisma.photoChallenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge || !challenge.isActive) {
      return NextResponse.json(
        { error: 'Haastetta ei löydy tai se ei ole aktiivinen' },
        { status: 404 }
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

    // Check if user already responded to this challenge
    const existingResponse = await prisma.photoChallengeResponse.findUnique({
      where: {
        challengeId_creatorId: {
          challengeId,
          creatorId
        }
      }
    });

    if (existingResponse) {
      return NextResponse.json(
        { error: 'Olet jo vastannut tähän haasteeseen' },
        { status: 400 }
      );
    }

    // Create the response
    const response = await prisma.photoChallengeResponse.create({
      data: {
        challengeId,
        imageUrl,
        comment,
        creatorId,
        // Auto-approve for now - could require admin approval later
        isApproved: true
      },
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
    console.error('Virhe vastauksen lähettämisessä:', error);
    return NextResponse.json(
      { error: 'Virhe vastauksen lähettämisessä' },
      { status: 500 }
    );
  }
}

// Get all responses for a challenge (admin endpoint)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: challengeId } = await params;
    
    const responses = await prisma.photoChallengeResponse.findMany({
      where: { challengeId },
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
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Virhe vastausten haussa:', error);
    return NextResponse.json(
      { error: 'Virhe vastausten haussa' },
      { status: 500 }
    );
  }
}