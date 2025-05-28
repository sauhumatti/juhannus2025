import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface IcebreakerAnswer {
  id: string;
  questionNumber: number;
  createdAt: Date;
  card: {
    cardId: number;
    user: {
      name: string;
    };
  };
  giver: {
    name: string;
  };
  receiver: {
    name: string;
  };
}

interface FormattedAnswer {
  id: string;
  cardId: number;
  cardOwner: string;
  questionNumber: number;
  giver: string;
  receiver: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const answers = await prisma.icebreakerAnswer.findMany({
      include: {
        card: {
          select: {
            cardId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        giver: {
          select: {
            name: true,
          },
        },
        receiver: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the answers for easier consumption
    const formattedAnswers: FormattedAnswer[] = answers.map((answer: IcebreakerAnswer) => ({
      id: answer.id,
      cardId: answer.card.cardId,
      cardOwner: answer.card.user.name,
      questionNumber: answer.questionNumber,
      giver: answer.giver.name,
      receiver: answer.receiver.name,
      createdAt: answer.createdAt
    }));

    return NextResponse.json(formattedAnswers);
  } catch (error) {
    console.error("Error fetching icebreaker answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch icebreaker answers" },
      { status: 500 }
    );
  }
}