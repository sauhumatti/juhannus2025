import { NextResponse } from 'next/server';
import { submitAnswer, updateAnswer, deleteAnswer, getParticipants } from '@/lib/icebreaker';

// Get all participants
export async function GET() {
  try {
    const participants = await getParticipants();
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Virhe osallistujien haussa:', error);
    return NextResponse.json(
      { error: 'Virhe osallistujien haussa' },
      { status: 500 }
    );
  }
}

// Submit an answer
export async function POST(req: Request) {
  try {
    const { cardId, questionNumber, giverId, receiverId } = await req.json();

    if (!cardId) {
      return NextResponse.json(
        { error: 'Kortin tunniste puuttuu' },
        { status: 400 }
      );
    }

    if (!questionNumber) {
      return NextResponse.json(
        { error: 'Kysymyksen numero puuttuu' },
        { status: 400 }
      );
    }

    if (!giverId) {
      return NextResponse.json(
        { error: 'Vastaajan tunniste puuttuu' },
        { status: 400 }
      );
    }

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Valitun henkilön tunniste puuttuu' },
        { status: 400 }
      );
    }

    await submitAnswer(cardId, questionNumber, giverId, receiverId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Virhe vastauksen tallennuksessa:', error);
    return NextResponse.json(
      { error: 'Virhe vastauksen tallennuksessa' },
      { status: 500 }
    );
  }
}

// Update an existing answer
export async function PUT(req: Request) {
  try {
    const { cardId, questionNumber, giverId, newReceiverId } = await req.json();

    if (!cardId) {
      return NextResponse.json(
        { error: 'Kortin tunniste puuttuu' },
        { status: 400 }
      );
    }

    if (!questionNumber) {
      return NextResponse.json(
        { error: 'Kysymyksen numero puuttuu' },
        { status: 400 }
      );
    }

    if (!giverId) {
      return NextResponse.json(
        { error: 'Vastaajan tunniste puuttuu' },
        { status: 400 }
      );
    }

    if (!newReceiverId) {
      return NextResponse.json(
        { error: 'Uuden henkilön tunniste puuttuu' },
        { status: 400 }
      );
    }

    await updateAnswer(cardId, questionNumber, giverId, newReceiverId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Virhe vastauksen päivittämisessä:', error);
    return NextResponse.json(
      { error: 'Virhe vastauksen päivittämisessä' },
      { status: 500 }
    );
  }
}

// Delete an existing answer
export async function DELETE(req: Request) {
  try {
    const { cardId, questionNumber, giverId } = await req.json();

    if (!cardId) {
      return NextResponse.json(
        { error: 'Kortin tunniste puuttuu' },
        { status: 400 }
      );
    }

    if (!questionNumber) {
      return NextResponse.json(
        { error: 'Kysymyksen numero puuttuu' },
        { status: 400 }
      );
    }

    if (!giverId) {
      return NextResponse.json(
        { error: 'Vastaajan tunniste puuttuu' },
        { status: 400 }
      );
    }

    await deleteAnswer(cardId, questionNumber, giverId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Virhe vastauksen poistamisessa:', error);
    return NextResponse.json(
      { error: 'Virhe vastauksen poistamisessa' },
      { status: 500 }
    );
  }
}