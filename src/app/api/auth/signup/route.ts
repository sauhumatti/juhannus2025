import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { username, name, password, photoUrl } = await req.json();

    if (!username || !name || !password || !photoUrl) {
      return NextResponse.json(
        { error: 'Käyttäjänimi, nimi, salasana ja profiilikuva vaaditaan' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Käyttäjänimi on jo käytössä' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        name,
        password,
        photoUrl,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Virhe käyttäjän luonnissa:', error);
    return NextResponse.json(
      { error: 'Virhe käyttäjän luonnissa' },
      { status: 500 }
    );
  }
}