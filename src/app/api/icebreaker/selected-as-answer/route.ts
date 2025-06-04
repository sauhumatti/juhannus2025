import { NextResponse } from 'next/server';
import { getSelectedAsAnswers } from '@/lib/icebreaker';

// Get questions where user was selected as answer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Käyttäjän tunniste puuttuu' },
        { status: 400 }
      );
    }

    const selectedAsAnswers = await getSelectedAsAnswers(userId);
    return NextResponse.json(selectedAsAnswers);
  } catch (error) {
    console.error('Virhe valittujen vastausten haussa:', error);
    return NextResponse.json(
      { error: 'Virhe valittujen vastausten haussa' },
      { status: 500 }
    );
  }
}