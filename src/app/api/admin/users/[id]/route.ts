import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user to check if it's an admin
    const user = await prisma.user.findUnique({
      where: { id: params.id }
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

    // Delete all related data in the correct order to handle foreign key constraints
    await prisma.$transaction([
      // Delete icebreaker related data
      prisma.icebreakerAnswer.deleteMany({
        where: {
          OR: [
            { giverId: params.id },
            { receiverId: params.id }
          ]
        }
      }),
      prisma.icebreakerCard.deleteMany({
        where: { userId: params.id }
      }),

      // Delete game scores
      prisma.dartScore.deleteMany({
        where: { userId: params.id }
      }),
      prisma.puttingScore.deleteMany({
        where: { userId: params.id }
      }),
      prisma.beerScore.deleteMany({
        where: { userId: params.id }
      }),

      // Delete beer pong stats
      prisma.beerPongStats.deleteMany({
        where: { userId: params.id }
      }),

      // Remove user from beer pong matches
      // Note: This will leave matches intact but remove the user from them
      prisma.beerPongMatch.updateMany({
        where: {
          OR: [
            { team1Players: { some: { id: params.id } } },
            { team2Players: { some: { id: params.id } } },
            { winners: { some: { id: params.id } } }
          ]
        },
        data: {
          // Remove user from all match relationships
          team1Players: {
            disconnect: { id: params.id }
          },
          team2Players: {
            disconnect: { id: params.id }
          },
          winners: {
            disconnect: { id: params.id }
          }
        }
      }),

      // Finally delete the user
      prisma.user.delete({
        where: { id: params.id }
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