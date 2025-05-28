import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check
    const data = await request.json();
    const { score, gameType } = data;

    if (typeof score !== "number") {
      return NextResponse.json(
        { error: "Score must be a number" },
        { status: 400 }
      );
    }

    let updatedRecord;

    try {
      switch (gameType) {
        case "Darts":
          updatedRecord = await prisma.dartScore.update({
            where: { id: params.id },
            data: { score },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          });
          break;

        case "Putting":
          updatedRecord = await prisma.puttingScore.update({
            where: { id: params.id },
            data: { score },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          });
          break;

        case "Beer":
          updatedRecord = await prisma.beerScore.update({
            where: { id: params.id },
            data: { time: score }, // For beer game, score is actually time
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          });
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

    return NextResponse.json({
      id: updatedRecord.id,
      userId: updatedRecord.userId,
      userName: updatedRecord.user.name,
      score: gameType === "Beer" ? updatedRecord.time : updatedRecord.score,
      gameType
    });
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
  { params }: { params: { id: string } }
) {
  try {
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
            where: { id: params.id }
          });
          break;

        case "Putting":
          await prisma.puttingScore.delete({
            where: { id: params.id }
          });
          break;

        case "Beer":
          await prisma.beerScore.delete({
            where: { id: params.id }
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