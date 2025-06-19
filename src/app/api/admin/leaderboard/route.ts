import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  score: number;
  gameType: string;
}

interface ScoreWithUser {
  id: string;
  userId: string;
  score?: number;
  time?: number;
  user: {
    name: string;
  };
}

export async function GET(_request: NextRequest) {
  try {
    // Fetch all types of scores
    const [dartScores, puttingScores, _beerPongMatches] = await Promise.all([
      prisma.dartScore.findMany({
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.puttingScore.findMany({
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.beerPongMatch.findMany({
        include: {
          winners: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: {
          status: 'completed'
        }
      }),
    ]);

    // Format all scores into a unified format
    const formattedEntries: LeaderboardEntry[] = [
      ...dartScores.map((entry: ScoreWithUser) => ({
        id: entry.id,
        userId: entry.userId,
        userName: entry.user.name,
        score: entry.score || 0,
        gameType: 'Darts'
      })),
      ...puttingScores.map((entry: ScoreWithUser) => ({
        id: entry.id,
        userId: entry.userId,
        userName: entry.user.name,
        score: entry.score || 0,
        gameType: 'Putting'
      })),
      // Beer Pong wins don't map to simple scores, skip this for now
    ];

    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}