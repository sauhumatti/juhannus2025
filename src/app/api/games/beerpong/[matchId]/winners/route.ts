import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBeerPongStats } from "@/lib/beerpong";

interface Context {
  params: {
    matchId: string;
  };
}

export async function POST(req: Request, context: Context) {
  try {
    const { winnerIds, loserIds } = await req.json();
    const matchId = context.params.matchId;

    if (!winnerIds?.length || !loserIds?.length) {
      return NextResponse.json(
        { error: "Voittajia ja häviäjiä ei määritelty" },
        { status: 400 }
      );
    }

    // Update match status and winners
    const updatedMatch = await prisma.beerPongMatch.update({
      where: { id: matchId },
      data: {
        status: "completed",
        winners: {
          connect: winnerIds.map((id: string) => ({ id })),
        },
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

    // Update player stats
    await updateBeerPongStats(winnerIds, loserIds);

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match winners:", error);
    return NextResponse.json(
      { error: "Virhe voittajien tallennuksessa" },
      { status: 500 }
    );
  }
}