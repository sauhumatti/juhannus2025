import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to get or create game state
async function getGameState() {
  let gameState = await prisma.gameState.findFirst();
  
  if (!gameState) {
    // Create initial game state if it doesn't exist
    gameState = await prisma.gameState.create({
      data: {
        isIcebreakerEnabled: false,
      }
    });
  }
  
  return gameState;
}

// Helper function to verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const sessionData = request.headers.get('x-session-data');
  
  if (sessionData) {
    try {
      const user = JSON.parse(sessionData);
      if (user.username === 'admin') {
        return user;
      }
    } catch (_e) {
      // Invalid session data
    }
  }
  
  return null;
}

export async function GET(_request: NextRequest) {
  try {
    const gameState = await getGameState();
    return NextResponse.json({ isIcebreakerEnabled: gameState.isIcebreakerEnabled });
  } catch (error) {
    console.error("Error fetching game state:", error);
    return NextResponse.json(
      { error: "Virhe pelin tilan haussa" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Ei oikeuksia muuttaa pelin tilaa" },
        { status: 403 }
      );
    }
    
    const { isIcebreakerEnabled } = await request.json();
    
    if (typeof isIcebreakerEnabled !== 'boolean') {
      return NextResponse.json(
        { error: "Virheellinen pelin tila" },
        { status: 400 }
      );
    }
    
    // Update or create game state
    const gameState = await prisma.gameState.upsert({
      where: { id: (await getGameState()).id },
      update: {
        isIcebreakerEnabled,
        lastUpdated: new Date(),
        updatedBy: adminUser.username,
      },
      create: {
        isIcebreakerEnabled,
        updatedBy: adminUser.username,
      }
    });
    
    return NextResponse.json({ isIcebreakerEnabled: gameState.isIcebreakerEnabled });
  } catch (error) {
    console.error("Error updating game state:", error);
    return NextResponse.json(
      { error: "Virhe pelin tilan päivittämisessä" },
      { status: 500 }
    );
  }
}