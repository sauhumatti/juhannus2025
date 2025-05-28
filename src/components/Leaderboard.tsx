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
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
          {scores.map((score, index) => (
            <tr key={score.id} className={index === 0 ? 'bg-yellow-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">#{index + 1}</div>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}