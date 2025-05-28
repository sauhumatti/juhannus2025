import { prisma } from './prisma';

interface User {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
}

interface BeerPongStats {
  userId: string;
  user: User;
  wins: number;
  losses: number;
  winStreak: number;
  bestStreak: number;
  lastUpdated: Date;
}

interface LeaderboardEntry extends User {
  wins: number;
  losses: number;
  winStreak: number;
  bestStreak: number;
  winPercentage: number;
  totalGames: number;
}

export async function updateBeerPongStats(
  winnerIds: string[],
  loserIds: string[]
) {
  try {
    // Update winners
    for (const winnerId of winnerIds) {
      const userStats = await prisma.beerPongStats.findUnique({
        where: { userId: winnerId },
      });

      if (userStats) {
        // Update existing stats
        await prisma.beerPongStats.update({
          where: { userId: winnerId },
          data: {
            wins: userStats.wins + 1,
            winStreak: userStats.winStreak + 1,
            bestStreak: Math.max(userStats.bestStreak, userStats.winStreak + 1),
            lastUpdated: new Date(),
          },
        });
      } else {
        // Create new stats
        await prisma.beerPongStats.create({
          data: {
            userId: winnerId,
            wins: 1,
            winStreak: 1,
            bestStreak: 1,
          },
        });
      }
    }

    // Update losers
    for (const loserId of loserIds) {
      const userStats = await prisma.beerPongStats.findUnique({
        where: { userId: loserId },
      });

      if (userStats) {
        // Update existing stats
        await prisma.beerPongStats.update({
          where: { userId: loserId },
          data: {
            losses: userStats.losses + 1,
            winStreak: 0,
            lastUpdated: new Date(),
          },
        });
      } else {
        // Create new stats
        await prisma.beerPongStats.create({
          data: {
            userId: loserId,
            losses: 1,
            winStreak: 0,
            bestStreak: 0,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error updating beer pong stats:', error);
    throw error;
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const stats = await prisma.beerPongStats.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            photoUrl: true,
          },
        },
      },
      orderBy: [
        { wins: 'desc' },
        { winStreak: 'desc' },
      ],
    });

    return stats.map((stat: BeerPongStats): LeaderboardEntry => ({
      ...stat.user,
      wins: stat.wins,
      losses: stat.losses,
      winStreak: stat.winStreak,
      bestStreak: stat.bestStreak,
      winPercentage: stat.wins + stat.losses > 0 
        ? Math.round((stat.wins / (stat.wins + stat.losses)) * 100)
        : 0,
      totalGames: stat.wins + stat.losses,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}