import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface User {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
}

interface Match {
  id: string;
  status: 'ongoing' | 'completed';
  team1Players: User[];
  team2Players: User[];
  winners: User[];
  team1Name?: string;
  team2Name?: string;
  createdAt: string | Date;
}

interface PlayerStats {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
  wins: number;
  losses: number;
  winStreak: number;
  bestStreak: number;
  games: string[]; // Array of match IDs to track game sequence
}

export async function GET() {
  try {
    const matches = await prisma.beerPongMatch.findMany({
      where: {
        status: "completed"
      },
      include: {
        team1Players: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
        team2Players: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
        winners: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
      },
    }) as unknown as Match[];

    // Calculate stats for each player
    const playerStats: Record<string, PlayerStats> = {};

    // Process all matches to build stats
    matches.forEach((match) => {
      const allPlayers = [...match.team1Players, ...match.team2Players];
      const winnerIds = new Set(match.winners.map(w => w.id));

      allPlayers.forEach((player) => {
        if (!playerStats[player.id]) {
          playerStats[player.id] = {
            id: player.id,
            name: player.name,
            username: player.username,
            photoUrl: player.photoUrl,
            wins: 0,
            losses: 0,
            winStreak: 0,
            bestStreak: 0,
            games: [],
          };
        }

        const stats = playerStats[player.id];
        const won = winnerIds.has(player.id);
        
        if (won) {
          stats.wins++;
          stats.winStreak++;
          stats.bestStreak = Math.max(stats.bestStreak, stats.winStreak);
        } else {
          stats.losses++;
          stats.winStreak = 0;
        }

        stats.games.push(match.id);
      });
    });

    // Convert to array and calculate percentages
    const leaderboard = Object.values(playerStats)
      .filter(player => player.wins + player.losses >= 3) // Only include players with 3+ games
      .map((player) => ({
        ...player,
        winPercentage: Math.round((player.wins / (player.wins + player.losses)) * 100),
        totalGames: player.wins + player.losses,
      }))
      .sort((a, b) => {
        // Sort by win percentage first, then by total games
        if (a.winPercentage !== b.winPercentage) {
          return b.winPercentage - a.winPercentage;
        }
        return b.totalGames - a.totalGames;
      });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Virhe tilastojen haussa" },
      { status: 500 }
    );
  }
}