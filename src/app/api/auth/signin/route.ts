import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (_e) {
      return NextResponse.json(
        { error: 'Virheellinen pyyntö - tyhjä tai virheellinen JSON' },
        { status: 400 }
      );
    }
    
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Käyttäjänimi vaaditaan' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Käyttäjää ei löydy' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Virhe sisäänkirjautumisessa:', error);
    return NextResponse.json(
      { error: 'Virhe sisäänkirjautumisessa' },
      { status: 500 }
    );
  }
}