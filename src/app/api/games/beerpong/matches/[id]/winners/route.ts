import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { winnerIds } = await req.json();
    const { id } = params;

    if (!winnerIds?.length) {
      return NextResponse.json(
        { error: "Voittajat puuttuvat" },
        { status: 400 }
      );
    }

    // Update match status and set winners
    const match = await prisma.beerPongMatch.update({
      where: { id },
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

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error setting winners:", error);
    return NextResponse.json(
      { error: "Virhe voittajien asettamisessa" },
      { status: 500 }
    );
  }
}