import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        photoUrl: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Virhe käyttäjien haussa:', error);
    return NextResponse.json(
      { error: 'Virhe käyttäjien haussa' },
      { status: 500 }
    );
  }
}