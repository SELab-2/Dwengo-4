import { getLeaderboard } from '@/util/student/questions';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';

// ...existing code...
export default function LeaderBoard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  });

  useEffect(() => {
    if (data) {
      console.log('Leaderboard data:', data);
    }
  }, [data]);

  if (isLoading)
    return <div className="text-center py-10">Loading leaderboard...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        Error loading leaderboard: {error.message}
      </div>
    );
  return (
    <div className="flex flex-col justify-center items-center mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold text-center text-dwengo-green mb-8 ">
        Leaderboard
      </h1>
      <div className="text-2xl p-6 shadow-md rounded-lg overflow-hidden w-[40rem] xl:w-[60rem]">
        <div className="flex flex-row justify-between mb-4">
          <div>Rank</div>
          <div>Name</div>
          <div className="text-right">Score</div>
        </div>
        {data && data.length > 0 ? (
          data.map((leaderBoardItem, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-4 p-4 border-b last:border-b-0 justify-center text-center"
            >
              <div className="flex flex-row font-bold">{index + 1}</div>
              <div>
                {leaderBoardItem.firstName} {leaderBoardItem.lastName}
              </div>
              <div className="text-right">
                {leaderBoardItem._count.QuestionMessage}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
}
