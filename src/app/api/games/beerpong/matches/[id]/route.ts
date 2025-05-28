import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    
    const match = await prisma.beerPongMatch.findUnique({
      where: { id: matchId },
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
    });

    if (!match) {
      return NextResponse.json(
        { error: "Peliä ei löytynyt" },
        { status: 404 }
      );
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json(
      { error: "Virhe pelin haussa" },
      { status: 500 }
    );
  }
}