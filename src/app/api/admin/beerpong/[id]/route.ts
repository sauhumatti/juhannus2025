import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface BeerPongPlayer {
  id: string;
  name: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const data = await request.json();
    const { status, winners } = data;

    const updatedMatch = await prisma.beerPongMatch.update({
      where: { id },
      data: {
        status,
        winners: winners ? {
          set: winners.map((id: string) => ({ id }))
        } : undefined
      },
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
    });

    // Update player stats if the match is completed
    if (status === "completed" && winners) {
      // Get all players involved in the match
      const allPlayers = [...updatedMatch.team1Players, ...updatedMatch.team2Players].map(p => p.id);
      
      // Update stats for all players
      await Promise.all(allPlayers.map(async (playerId) => {
        const isWinner = winners.includes(playerId);
        
        await prisma.beerPongStats.upsert({
          where: { userId: playerId },
          create: {
            userId: playerId,
            wins: isWinner ? 1 : 0,
            losses: isWinner ? 0 : 1,
            winStreak: isWinner ? 1 : 0,
            bestStreak: isWinner ? 1 : 0
          },
          update: {
            wins: {
              increment: isWinner ? 1 : 0
            },
            losses: {
              increment: isWinner ? 0 : 1
            },
            winStreak: isWinner ? {
              increment: 1
            } : 0,
            ...(isWinner && {
              bestStreak: {
                increment: 1
              }
            }),
            lastUpdated: new Date()
          }
        });
      }));
    }

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Match update error:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    // First get the match to check its status
    const match = await prisma.beerPongMatch.findUnique({
      where: { id },
      include: {
        winners: true,
        team1Players: true,
        team2Players: true
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    // If the match was completed, we need to update player stats
    if (match.status === "completed" && match.winners.length > 0) {
      const allPlayers = [...match.team1Players, ...match.team2Players].map(p => p.id);
      
      // Decrement stats for all players
      await Promise.all(allPlayers.map(async (playerId) => {
        const isWinner = match.winners.some((w: BeerPongPlayer) => w.id === playerId);
        
        const stats = await prisma.beerPongStats.findUnique({
          where: { userId: playerId }
        });

        if (stats) {
          await prisma.beerPongStats.update({
            where: { userId: playerId },
            data: {
              wins: {
                decrement: isWinner ? 1 : 0
              },
              losses: {
                decrement: isWinner ? 0 : 1
              },
              // Note: We don't adjust win streaks as historical streaks should remain
              lastUpdated: new Date()
            }
          });
        }
      }));
    }

    // Finally delete the match
    await prisma.beerPongMatch.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Match delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 }
    );
  }
}
