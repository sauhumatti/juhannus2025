import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const matches = await prisma.beerPongMatch.findMany({
      include: {
        team1Players: {
          select: {
            id: true,
            name: true,
          },
        },
        team2Players: {
          select: {
            id: true,
            name: true,
          },
        },
        winners: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching beer pong matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}