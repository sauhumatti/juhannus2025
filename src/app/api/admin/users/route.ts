import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface _MinimalIcebreakerAnswer {
  id: string;
}

interface DbUser {
  id: string;
  username: string;
  name: string;
  photoUrl: string;
  dartScores: { score: number }[];
  puttingScores: { score: number }[];
  // beerScores: { time: number }[];
  beerPongStats: {
    wins: number;
    losses: number;
  } | null;
  // assignedCard: {
  //   answers: MinimalIcebreakerAnswer[];
  // } | null;
}

interface FormattedUser {
  id: string;
  username: string;
  name: string;
  photoUrl: string;
  dartScores: { score: number }[];
  puttingScores: { score: number }[];
  // beerScores: { time: number }[];
  beerPongStats: {
    wins: number;
    losses: number;
  } | null;
  icebreaker: {
    hasCard: boolean;
    answersCount: number;
    totalQuestions: number;
  };
}

export async function GET(_request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        dartScores: true,
        puttingScores: true,
        // beerScores: true,
        beerPongStats: true,
        // assignedCard: {
        //   include: {
        //     answers: true
        //   }
        // }
      }
    });

    // Format the user data to include icebreaker progress
    const formattedUsers: FormattedUser[] = users.map((user: DbUser) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      photoUrl: user.photoUrl,
      dartScores: user.dartScores,
      puttingScores: user.puttingScores,
      // beerScores: user.beerScores,
      beerPongStats: user.beerPongStats,
      icebreaker: {
        hasCard: false, // !!user.assignedCard,
        answersCount: 0, // user.assignedCard?.answers.length || 0,
        totalQuestions: 20
      }
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}