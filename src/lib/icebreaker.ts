import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from './prisma';

interface Question {
  number: number;
  text: string;
}

interface Card {
  id: number;
  set: number;
  title: string;
  subtitle: string;
  questions: Question[];
}

export async function loadCards(): Promise<Card[]> {
  const filePath = path.join(process.cwd(), 'tutustumiskortit.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function assignCardToUser(userId: string): Promise<{
  id: string;
  cardId: number;
  questions: Question[];
}> {
  // Get all assigned cards to find the next available card number
  const assignedCards = await prisma.icebreakerCard.findMany({
    orderBy: { cardId: 'desc' },
  });

  // Load all cards
  const allCards = await loadCards();
  const totalCards = allCards.length;

  // Find the next card ID to assign
  let nextCardId = 1;
  if (assignedCards.length > 0) {
    const lastCardId = assignedCards[0].cardId;
    nextCardId = lastCardId >= totalCards ? 1 : lastCardId + 1;
  }

  // Find the card with this ID
  const card = allCards.find(c => c.id === nextCardId);
  if (!card) {
    throw new Error('Card not found');
  }

  // Create the card assignment
  const newCard = await prisma.icebreakerCard.create({
    data: {
      cardId: nextCardId,
      userId,
    }
  });

  return {
    id: newCard.id,
    cardId: nextCardId,
    questions: card.questions
  };
}

export async function submitAnswer(
  cardId: string,
  questionNumber: number,
  giverId: string,
  receiverId: string
): Promise<void> {
  // Find the IcebreakerCard first to get its ID
  const card = await prisma.icebreakerCard.findUnique({
    where: { id: cardId }
  });

  if (!card) {
    throw new Error('Card not found');
  }

  await prisma.icebreakerAnswer.create({
    data: {
      cardId,
      questionNumber,
      giverId,
      receiverId,
    }
  });
}

export async function updateAnswer(
  cardId: string,
  questionNumber: number,
  giverId: string,
  newReceiverId: string
): Promise<void> {
  // Find the existing answer
  const existingAnswer = await prisma.icebreakerAnswer.findUnique({
    where: {
      cardId_questionNumber_giverId: {
        cardId,
        questionNumber,
        giverId
      }
    }
  });

  if (!existingAnswer) {
    throw new Error('Answer not found');
  }

  // Update the answer
  await prisma.icebreakerAnswer.update({
    where: {
      cardId_questionNumber_giverId: {
        cardId,
        questionNumber,
        giverId
      }
    },
    data: {
      receiverId: newReceiverId,
    }
  });
}

export async function deleteAnswer(
  cardId: string,
  questionNumber: number,
  giverId: string
): Promise<void> {
  // Find the existing answer
  const existingAnswer = await prisma.icebreakerAnswer.findUnique({
    where: {
      cardId_questionNumber_giverId: {
        cardId,
        questionNumber,
        giverId
      }
    }
  });

  if (!existingAnswer) {
    throw new Error('Answer not found');
  }

  // Delete the answer
  await prisma.icebreakerAnswer.delete({
    where: {
      cardId_questionNumber_giverId: {
        cardId,
        questionNumber,
        giverId
      }
    }
  });
}

export async function getCardWithAnswers(userId: string) {
  const assignedCard = await prisma.icebreakerCard.findFirst({
    where: { userId },
    include: {
      answers: {
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
              photoUrl: true,
            }
          }
        }
      }
    }
  });

  if (!assignedCard) {
    return null;
  }

  const cards = await loadCards();
  const cardData = cards.find(c => c.id === assignedCard.cardId);

  if (!cardData) {
    throw new Error('Card data not found');
  }

  // Return combined data with database ID
  return {
    dbId: assignedCard.id,
    cardId: assignedCard.cardId,
    title: cardData.title,
    subtitle: cardData.subtitle,
    questions: cardData.questions,
    answers: assignedCard.answers.reduce((acc: Record<number, {
      id: string;
      name: string;
      username: string;
      photoUrl: string;
    }>, answer: {
      questionNumber: number;
      receiver: {
        id: string;
        name: string;
        username: string;
        photoUrl: string;
      }
    }) => {
      acc[answer.questionNumber] = answer.receiver;
      return acc;
    }, {})
  };
}

export async function getParticipants() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      photoUrl: true,
    },
    orderBy: {
      name: 'asc',
    }
  });
}