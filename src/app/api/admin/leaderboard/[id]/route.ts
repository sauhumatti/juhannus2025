import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TODO: Add admin authentication check
    const data = await request.json();
    const { score, gameType } = data;

    if (typeof score !== "number") {
      return NextResponse.json(
        { error: "Score must be a number" },
        { status: 400 }
      );
    }

    let result; // Declare a variable to hold the final result object

    try {
      switch (gameType) {
        case "Darts":
          const dartRecord = await prisma.dartScore.update({
            where: { id },
            data: { score },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          });
          result = {
            id: dartRecord.id,
            userId: dartRecord.userId,
            userName: dartRecord.user.name,
            score: dartRecord.score,
            gameType: 'Darts'
          };
          break;

        case "Putting":
          const puttingRecord = await prisma.puttingScore.update({
            where: { id },
            data: { score },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          });
          result = {
            id: puttingRecord.id,
            userId: puttingRecord.userId,
            userName: puttingRecord.user.name,
            score: puttingRecord.score,
            gameType: 'Putting'
          };
          break;


        default:
          return NextResponse.json(
            { error: "Invalid game type" },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Record not found or update failed" },
        { status: 404 }
      );
    }

    // Return the correctly structured result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Score update error:", error);
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TODO: Add admin authentication check
    const gameType = request.nextUrl.searchParams.get("gameType");
    
    if (!gameType) {
      return NextResponse.json(
        { error: "Game type is required" },
        { status: 400 }
      );
    }

    try {
      switch (gameType) {
        case "Darts":
          await prisma.dartScore.delete({
            where: { id }
          });
          break;

        case "Putting":
          await prisma.puttingScore.delete({
            where: { id }
          });
          break;


        default:
          return NextResponse.json(
            { error: "Invalid game type" },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error("Database delete error:", error);
      return NextResponse.json(
        { error: "Record not found or delete failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Score delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete score" },
      { status: 500 }
    );
  }
}