import Image from 'next/image';

type Score = {
  id: string;
  user: {
    name: string;
    username: string;
    photoUrl: string;
  };
  score?: number;
  time?: number;
  createdAt: string;
};

interface LeaderboardProps {
  scores: Score[];
  type: 'points' | 'time';
  maxScore?: number;
}

export default function Leaderboard({ scores, type, maxScore }: LeaderboardProps) {
  // Calculate positions for tied scores
  const getPosition = (index: number, currentScore: Score, allScores: Score[]) => {
    if (type === 'time') {
      // For time-based scores, lower is better
      const sameTimeCount = allScores.slice(0, index).filter(s => s.time === currentScore.time).length;
      if (sameTimeCount > 0) {
        // Find the position of the first occurrence of this time
        const firstOccurrenceIndex = allScores.findIndex(s => s.time === currentScore.time);
        return firstOccurrenceIndex + 1;
      }
      return index + 1;
    } else {
      // For points-based scores, higher is better
      const sameScoreCount = allScores.slice(0, index).filter(s => s.score === currentScore.score).length;
      if (sameScoreCount > 0) {
        // Find the position of the first occurrence of this score
        const firstOccurrenceIndex = allScores.findIndex(s => s.score === currentScore.score);
        return firstOccurrenceIndex + 1;
      }
      return index + 1;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Mobile view - card layout */}
      <div className="block sm:hidden">
        <div className="divide-y divide-gray-200">
          {scores.map((score, index) => {
            const position = getPosition(index, score, scores);
            const isFirstPlace = position === 1;
            
            return (
              <div key={score.id} className={`p-4 ${isFirstPlace ? 'bg-yellow-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900 mr-3">#{position}</span>
                  <div className="flex-shrink-0 h-8 w-8 relative">
                    <Image
                      src={score.user.photoUrl}
                      alt={score.user.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {score.user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      @{score.user.username}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {type === 'points' ? (
                      <span>
                        {score.score}
                        {maxScore && <span className="text-sm text-gray-500">/{maxScore}</span>}
                      </span>
                    ) : (
                      <span>{score.time?.toFixed(2)}s</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(score.createdAt).toLocaleDateString('fi-FI')}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Desktop view - table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sija
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pelaaja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {type === 'points' ? 'Pisteet' : 'Aika'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Päivämäärä
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scores.map((score, index) => {
              const position = getPosition(index, score, scores);
              const isFirstPlace = position === 1;
              
              return (
                <tr key={score.id} className={isFirstPlace ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{position}</div>
                  </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative">
                      <Image
                        src={score.user.photoUrl}
                        alt={score.user.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {score.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{score.user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {type === 'points' ? (
                      <span>
                        {score.score}
                        {maxScore && <span className="text-gray-500">/{maxScore}</span>}
                      </span>
                    ) : (
                      <span>{score.time?.toFixed(2)}s</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(score.createdAt).toLocaleDateString('fi-FI')}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}