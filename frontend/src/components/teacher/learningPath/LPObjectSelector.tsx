import { LearningObject, LearningPath } from '@/types/type';
import { fetchLearningObjectsByLearningPath } from '@/util/teacher/learningPath';
import { useQuery } from '@tanstack/react-query';
import React, { memo, useCallback, useState } from 'react';
import { LOCard } from './LOCard';

interface LPObjectSelectorProps {
  path: LearningPath;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string) => void;
}

export const LPObjectSelector: React.FC<LPObjectSelectorProps> = memo(
  ({ path, selectedComponentId, setSelectedComponentId }) => {
    // don't refetch objects on click if they've already been fetched
    const [fetched, setFetched] = useState(false);
    // only show objects if the button is clicked
    const [viewingObjects, setViewingObjects] = useState(false);

    const {
      data: learningObjects,
      isLoading: isLoadingLearningObjects,
      isError: isErrorLearningObjects,
      error: errorLearningObjects,
      refetch: refetchLearningObjects,
    } = useQuery<LearningObject[]>({
      queryKey: ['learningObjects', path.id],
      // kind of doing double work here, since this route fetches the learning path again (extra dwengo api call)
      queryFn: () => fetchLearningObjectsByLearningPath(path.id),
      enabled: false, // disable automatic fetching (only fetch when 'view objects' is clicked)
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });

    const handleViewObjects = () => {
      // in the other case, objects are in the cache, so don't refetch
      if (!fetched) {
        refetchLearningObjects();
        setFetched(true); // set fetched to true to prevent double fetching
      }
      setViewingObjects(!viewingObjects); // toggle viewing objects
    };

    // to avoid unnecessarily re-rendering LOCards
    const handleSelectObject = useCallback(
      (objectId: string) => {
        setSelectedComponentId(`${path.id}-${objectId}`);
      },
      [path.id], // only depends on path.id
    );

    return (
      <div className={`p-4 border rounded`}>
        <div className="flex justify-between items-center gap-4">
          <div>
            <h2 className="font-bold text-xl">{path.title}</h2>
            <p className="text-sm">{path.description}</p>
            <p className="text-sm">
              <span className="font-medium">Language:</span> {path.language}
            </p>
          </div>
          <button
            className={`
            px-4 py-2 text-sm font-medium text-white bg-dwengo-green cursor-pointer
            rounded hover:bg-dwengo-green-dark transition h-10 flex-shrink-0
        `}
            onClick={handleViewObjects}
          >
            {viewingObjects ? 'Hide Objects' : 'View Objects'}
          </button>
        </div>

        {/* conditionally render learning objects */}
        {viewingObjects && (
          <div className="mt-4">
            {isLoadingLearningObjects && <p>Loading learning objects...</p>}
            {isErrorLearningObjects && (
              <p>Error: {errorLearningObjects?.message}</p>
            )}
            {learningObjects && (
              <ul className="list-disc pl-6">
                {learningObjects.map((object) => (
                  <li key={object.id} className="text-sm mb-4">
                    <LOCard
                      object={object}
                      isSelectedObject={
                        selectedComponentId === `${path.id}-${object.id}`
                      }
                      setSelectedComponentId={handleSelectObject}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  },
);
