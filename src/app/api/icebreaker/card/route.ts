import { NextResponse } from 'next/server';
import { assignCardToUser, getCardWithAnswers } from '@/lib/icebreaker';

// Get user's assigned card
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

    const card = await getCardWithAnswers(userId);
    
    if (!card) {
      try {
        // Assign new card if user doesn't have one
        const newCard = await assignCardToUser(userId);
        return NextResponse.json({
          dbId: newCard.id,
          cardId: newCard.cardId,
          title: `KORTTI ${newCard.cardId}`,
          subtitle: `Setti ${Math.ceil(newCard.cardId / 20)}`,
          questions: newCard.questions,
          answers: {}
        });
      } catch (err) {
        console.error('Virhe kortin luonnissa:', err);
        throw new Error('Kortin luonti epäonnistui');
      }
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error('Virhe kortin haussa:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Virhe kortin haussa'
      },
      { status: 500 }
    );
  }
}