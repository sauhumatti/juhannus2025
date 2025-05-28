import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { team1PlayerIds, team2PlayerIds, team1Name, team2Name } = await req.json();

    if (!team1PlayerIds?.length || !team2PlayerIds?.length) {
      return NextResponse.json(
        { error: "Molemmissa joukkueissa tulee olla pelaajia" },
        { status: 400 }
      );
    }

    // Validate teams: ensure no team has more than 2 players
    if (team1PlayerIds.length > 2 || team2PlayerIds.length > 2) {
      return NextResponse.json(
        { error: 'Joukkueessa voi olla korkeintaan 2 pelaajaa' },
        { status: 400 }
      );
    }

    // Create new match
    const match = await prisma.beerPongMatch.create({
      data: {
        status: "ongoing",
        team1Players: {
          connect: team1PlayerIds.map((id: string) => ({ id })),
        },
        team2Players: {
          connect: team2PlayerIds.map((id: string) => ({ id })),
        },
        team1Name,
        team2Name,
      },
      include: {
        team1Players: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
        team2Players: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
      },
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Virhe pelin luonnissa" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const matches = await prisma.beerPongMatch.findMany({
      include: {
        team1Players: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
        team2Players: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
        winners: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Virhe pelien haussa" },
      { status: 500 }
    );
  }
}