import React, { useEffect, useState } from 'react';
import { LearningObject, LearningPath } from '../../../types/type';
import { useQuery } from '@tanstack/react-query';
import { fetchLearningPaths } from '@/util/shared/learningPath';
import { fetchOwnedLearningObjects } from '@/util/teacher/httpLearningPaths';
import { LPObjectSelector } from '@/components/teacher/editLearningPath/LPObjectSelector';
import { useLPEditContext } from '@/context/LearningPathEditContext';
import { LOCard } from './LOCard';

const SelectLearningObject: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLearningPaths, setFilteredLearningPaths] = useState<
    LearningPath[]
  >([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  // user can select from learning paths or directly from their own learning objects
  const [viewMode, setViewMode] = useState<'paths' | 'objects'>('paths');
  const { language } = useLPEditContext();

  // fetch all learning paths, so that user can select learning objects from them
  const {
    data: allLearningPaths,
    isLoading: isLoadingPaths,
    isError: isErrorPaths,
  } = useQuery<LearningPath[]>({
    queryKey: ['learningPaths'],
    queryFn: fetchLearningPaths,
    staleTime: 5 * 60 * 1000, // consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // keep unused data in cache for 30 minutes
  });

  const {
    data: ownedLearningObjects,
    isLoading: isLoadingOwnedObjects,
    isError: isErrorOwnedObjects,
  } = useQuery<LearningObject[]>({
    queryKey: ['learningObjects'],
    queryFn: fetchOwnedLearningObjects,
    staleTime: 10 * 60 * 1000, // consider data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // keep unused data in cache for 30 minutes
  });

  useEffect(() => {
    if (allLearningPaths) {
      const results = allLearningPaths.filter((path) => {
        // filter by title search term
        const matchesTitle = path.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        // only filter by language if language is not empty
        const matchesLanguage = !language || path.language === language;

        return matchesTitle && matchesLanguage;
      });
      setFilteredLearningPaths(results);
    }
  }, [searchTerm, allLearningPaths, language]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); // update the search term
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Select a learning object</h1>

      {/* toggle between learning paths and learning objects */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setViewMode('paths')}
          className={`px-4 py-2 rounded hover:cursor-pointer ${
            viewMode === 'paths'
              ? 'bg-dwengo-green text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          From Learning Paths
        </button>
        <button
          onClick={() => setViewMode('objects')}
          className={`px-4 py-2 rounded hover:cursor-pointer ${
            viewMode === 'objects'
              ? 'bg-dwengo-green text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          From My Learning Objects
        </button>
      </div>

      {/* search input */}
      <input
        type="text"
        placeholder={`Search ${viewMode === 'paths' ? 'learning paths' : 'learning objects'}...`}
        value={searchTerm}
        onChange={handleInputChange}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      {/* loading state */}
      {viewMode === 'paths' && isLoadingPaths && (
        <p>Loading learning paths...</p>
      )}
      {viewMode === 'objects' && isLoadingOwnedObjects && (
        <p>Loading learning objects...</p>
      )}

      {/* error state */}
      {viewMode === 'paths' && isErrorPaths && (
        <p className="text-red-500">Failed to load learning paths.</p>
      )}
      {viewMode === 'objects' && isErrorOwnedObjects && (
        <p className="text-red-500">Failed to load learning objects.</p>
      )}

      {/* results */}
      <ul>
        {viewMode === 'paths' &&
          filteredLearningPaths.map((path) => (
            <li key={path.id} className="mb-2">
              <LPObjectSelector
                path={path}
                selectedComponentId={selectedComponentId}
                setSelectedComponentId={setSelectedComponentId}
              />
            </li>
          ))}

        {viewMode === 'objects' &&
          ownedLearningObjects?.map((object) => (
            <li key={object.id} className="text-sm mb-4">
              <LOCard
                object={object}
                isSelectedObject={selectedComponentId === object.id}
                setSelectedComponentId={setSelectedComponentId}
              />
            </li>
          ))}
      </ul>

      {/* no results message */}
      {!isLoadingPaths &&
        !isErrorPaths &&
        viewMode === 'paths' &&
        filteredLearningPaths.length === 0 && (
          <p className="text-gray-500">No results found for "{searchTerm}".</p>
        )}

      {!isLoadingOwnedObjects &&
        !isErrorOwnedObjects &&
        viewMode === 'objects' &&
        ownedLearningObjects?.length === 0 && (
          <p className="text-gray-500">No learning objects found.</p>
        )}
    </div>
  );
};

export default SelectLearningObject;
