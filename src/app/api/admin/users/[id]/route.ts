// File: src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user to check if it's an admin
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting admin users
    if (user.username === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin user" },
        { status: 403 }
      );
    }

    // Step 1: Find all BeerPongMatches that the user is part of.
    // This query happens outside the `prisma.$transaction` array directly,
    // as it's a read operation and its result is used to build write operations.
    const matchesInvolvingUser = await prisma.beerPongMatch.findMany({
      where: {
        OR: [
          { team1Players: { some: { id } } },
          { team2Players: { some: { id } } },
          { winners: { some: { id } } }
        ]
      },
      select: { id: true } // We only need the match ID for updates
    });

    // Step 2: Create an array of update operations for each found match.
    // These will be individual `prisma.beerPongMatch.update` calls.
    const beerPongMatchDisconnectOps = matchesInvolvingUser.map(match =>
      prisma.beerPongMatch.update({
        where: { id: match.id },
        data: {
          team1Players: { disconnect: { id } },
          team2Players: { disconnect: { id } },
          winners: { disconnect: { id } }
        }
      })
    );

    // Step 3: Now, perform all deletions and disconnects within a single transaction
    await prisma.$transaction([
      // Delete icebreaker related data
      prisma.icebreakerAnswer.deleteMany({
        where: {
          OR: [
            { giverId: id },
            { receiverId: id }
          ]
        }
      }),
      prisma.icebreakerCard.deleteMany({
        where: { userId: id }
      }),

      // Delete game scores
      prisma.dartScore.deleteMany({
        where: { userId: id }
      }),
      prisma.puttingScore.deleteMany({
        where: { userId: id }
      }),
      prisma.beerScore.deleteMany({
        where: { userId: id }
      }),

      // Delete beer pong stats
      prisma.beerPongStats.deleteMany({
        where: { userId: id }
      }),

      // Disconnect the user from all relevant BeerPongMatch records.
      // We spread the array of individual update promises created above.
      ...beerPongMatchDisconnectOps,

      // Finally delete the user
      prisma.user.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}