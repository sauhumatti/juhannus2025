import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Käyttäjän tunniste puuttuu' },
        { status: 400 }
      );
    }

    // Get answers given by the user (commented out - model doesn't exist)
    const answersGiven = 0; // await prisma.icebreakerAnswer.count({
    //   where: { giverId: userId }
    // });

    // Get answers where user is selected (commented out - model doesn't exist)
    const timesSelected = 0; // await prisma.icebreakerAnswer.count({
    //   where: { receiverId: userId }
    // });

    // Get unique cards where user appears (commented out - model doesn't exist)
    const uniqueCardsWhereSelected: any[] = []; // await prisma.icebreakerAnswer.findMany({
    //   where: { receiverId: userId },
    //   select: {
    //     cardId: true
    //   },
    //   distinct: ['cardId']
    // });

    // Get the user's own card and its completion (commented out - model doesn't exist)
    const userCard: any = null; // await prisma.icebreakerCard.findFirst({
    //   where: { userId },
    //   include: {
    //     answers: true
    //   }
    // });

    return NextResponse.json({
      answersGiven,
      timesSelected,
      uniqueCardsCount: uniqueCardsWhereSelected.length,
      ownCardProgress: userCard ? userCard.answers.length : 0
    });
  } catch (error) {
    console.error('Virhe tilastojen haussa:', error);
    return NextResponse.json(
      { error: 'Virhe tilastojen haussa' },
      { status: 500 }
    );
  }
}