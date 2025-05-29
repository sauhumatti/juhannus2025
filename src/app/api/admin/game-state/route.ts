import { NextRequest, NextResponse } from "next/server";

// In-memory state for quick access (in production, this should be in Redis/DB)
let isIcebreakerEnabled = false;

export async function GET(_request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    return NextResponse.json({ isIcebreakerEnabled });
  } catch (error) {
    console.error("Error fetching game state:", error);
    return NextResponse.json(
      { error: "Failed to fetch game state" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const data = await request.json();
    isIcebreakerEnabled = data.isIcebreakerEnabled;
    
    return NextResponse.json({ isIcebreakerEnabled });
  } catch (error) {
    console.error("Error updating game state:", error);
    return NextResponse.json(
      { error: "Failed to update game state" },
      { status: 500 }
    );
  }
}