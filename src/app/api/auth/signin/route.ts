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
    
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Käyttäjänimi ja salasana vaaditaan' },
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

    // Simple password check (no hashing since you requested no secure passwords)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Väärä salasana' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Virhe sisäänkirjautumisessa:', error);
    return NextResponse.json(
      { error: 'Virhe sisäänkirjautumisessa' },
      { status: 500 }
    );
  }
}