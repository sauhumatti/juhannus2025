import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Käyttäjän ID vaaditaan' },
        { status: 400 }
      );
    }

    // Fetch existing models that work
    const [dartScores, puttingScores] = await Promise.all([
      prisma.dartScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.puttingScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Try to fetch new models safely
    let grillScores: Array<{ score: number; createdAt: Date; id: string }> = [];
    let mosquitoScores: Array<{ score: number; createdAt: Date; id: string }> = [];
    let memoryScores: Array<{ score: number; createdAt: Date; id: string }> = [];
    
    try {
      grillScores = await (prisma as Record<string, any>).grillScore?.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }) || [];
    } catch (_e) {
      console.log('GrillScore not available yet');
    }
    
    try {
      mosquitoScores = await (prisma as Record<string, any>).mosquitoScore?.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }) || [];
    } catch (_e) {
      console.log('MosquitoScore not available yet');
    }
    
    try {
      memoryScores = await (prisma as Record<string, any>).memoryScore?.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }) || [];
    } catch (_e) {
      console.log('MemoryScore not available yet');
    }

    // Fetch Beer Pong stats
    let beerPongStats = null;
    try {
      const userStats = await prisma.beerPongStats.findUnique({
        where: { userId },
      });


      if (userStats) {
        // Get recent matches where user participated
        const recentMatches = await prisma.beerPongMatch.findMany({
          where: {
            OR: [
              { team1Players: { some: { id: userId } } },
              { team2Players: { some: { id: userId } } }
            ],
            status: 'completed'
          },
          include: {
            team1Players: { select: { name: true } },
            team2Players: { select: { name: true } },
            winners: { select: { id: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        });

        beerPongStats = {
          wins: userStats.wins,
          losses: userStats.losses,
          winStreak: userStats.winStreak,
          bestStreak: userStats.bestStreak,
          recentMatches: recentMatches.map(match => {
            const userWon = match.winners.some(winner => winner.id === userId);
            // Get all players except the current user
            const allPlayers = [...match.team1Players, ...match.team2Players];
            const opponents = allPlayers.filter((p: { name: string }) => p.name !== userId);
            
            return {
              id: match.id,
              createdAt: match.createdAt.toISOString(),
              won: userWon,
              opponents: opponents.map((p: { name: string }) => ({ name: p.name }))
            };
          })
        };
      }
    } catch (e) {
      console.log('Beer Pong stats not available:', e);
    }

    // Fetch Mölkky stats
    let molkkyStats = null;
    try {
      const userMolkkyGames = await prisma.molkkyPlayer.findMany({
        where: { userId },
        include: {
          game: {
            include: {
              players: true
            }
          }
        },
        orderBy: { joinedAt: 'desc' },
        take: 10
      });

      if (userMolkkyGames.length > 0) {
        const completedGames = userMolkkyGames.filter(p => p.game.status === 'completed' && p.position !== null);
        const gamesWon = completedGames.filter(p => p.position === 1).length;
        const totalGames = completedGames.length;
        const averagePosition = totalGames > 0 
          ? completedGames.reduce((sum, p) => sum + (p.position || 0), 0) / totalGames 
          : 0;

        molkkyStats = {
          gamesWon,
          totalGames,
          averagePosition: Math.round(averagePosition * 10) / 10,
          recentGames: completedGames.map(p => ({
            id: p.game.id,
            createdAt: p.game.createdAt.toISOString(),
            position: p.position || 0,
            totalPlayers: p.game.players.length
          }))
        };
      }
    } catch (e) {
      console.log('Mölkky stats not available:', e);
    }

    // Fetch Kuvahaaste (Photo Challenge) stats
    let kuvahaasteStats = null;
    try {
      // Get challenges created by user
      const challengesCreated = await prisma.photoChallenge.count({
        where: { creatorId: userId }
      });

      // Get approved responses by user
      const responsesApproved = await prisma.photoChallengeResponse.count({
        where: { 
          creatorId: userId,
          isApproved: true
        }
      });

      // Get recent responses
      const recentResponses = await prisma.photoChallengeResponse.findMany({
        where: { 
          creatorId: userId,
          isApproved: true
        },
        include: {
          challenge: {
            select: {
              id: true,
              title: true,
              creator: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      kuvahaasteStats = {
        challengesCreated,
        responsesApproved,
        recentResponses: recentResponses.map(r => ({
          id: r.id,
          challengeTitle: r.challenge.title,
          challengeCreator: r.challenge.creator.name,
          createdAt: r.createdAt.toISOString(),
          comment: r.comment
        }))
      };
    } catch (e) {
      console.log('Kuvahaaste stats not available:', e);
    }

    return NextResponse.json({
      dartScores,
      puttingScores,
      grillScores,
      mosquitoScores,
      memoryScores,
      beerPongStats,
      molkkyStats,
      kuvahaasteStats,
    });
  } catch (error) {
    console.error('Virhe tulosten haussa:', error);
    return NextResponse.json(
      { error: 'Virhe tulosten haussa' },
      { status: 500 }
    );
  }
}