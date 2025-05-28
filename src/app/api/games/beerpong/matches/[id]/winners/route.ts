import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBeerPongStats } from "@/lib/beerpong";

type Player = {
  id: string;
  name: string;
  username: string;
  photoUrl: string | null;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const { winnerIds } = await req.json();

    if (!winnerIds || !Array.isArray(winnerIds) || winnerIds.length === 0) {
      return NextResponse.json(
        { error: "Winner IDs are required" },
        { status: 400 }
      );
    }

    // Get the match to find all players
    const match = await prisma.beerPongMatch.findUnique({
      where: { id: matchId },
      include: {
        team1Players: true,
        team2Players: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    if (match.status === "completed") {
      return NextResponse.json(
        { error: "Match already completed" },
        { status: 400 }
      );
    }

    // Update match with winners
    const updatedMatch = await prisma.beerPongMatch.update({
      where: { id: matchId },
      data: {
        winners: {
          connect: winnerIds.map((id: string) => ({ id })),
        },
        status: "completed",
      },
      include: {
        team1Players: true,
        team2Players: true,
        winners: true,
      },
    });

    // Calculate loser IDs from all players not in winners
    const allPlayerIds = [
      ...match.team1Players.map((p: Player) => p.id),
      ...match.team2Players.map((p: Player) => p.id),
    ];
    const loserIds = allPlayerIds.filter(id => !winnerIds.includes(id));

    // Update player statistics
    await updateBeerPongStats(winnerIds, loserIds);

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match winners:", error);
    return NextResponse.json(
      { error: "Error updating match" },
      { status: 500 }
    );
  }
}