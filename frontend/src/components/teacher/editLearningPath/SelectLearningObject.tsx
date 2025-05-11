import React, { useEffect, useState } from 'react';
import { LearningPath } from '../../../types/type';
import { useQuery } from '@tanstack/react-query';
import { fetchLearningPaths } from '@/util/teacher/learningPath';
import { LPObjectSelector } from '@/components/teacher/editLearningPath/LPObjectSelector';
import { useLPEditContext } from '@/context/LearningPathEditContext';

const SelectLearningObject: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLearningPaths, setFilteredLearningPaths] = useState<
    LearningPath[]
  >([]);
  // use a combination of path id and object id as the selected component id (since paths can contain the same objects)
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
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
    setSearchTerm(e.target.value); // Update the search term
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Select a learning object from a learning path
      </h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search learning paths..."
        value={searchTerm}
        onChange={handleInputChange}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      {/* Loading State */}
      {isLoadingPaths && <p>Loading...</p>}

      {/* Error State */}
      {isErrorPaths && (
        <p className="text-red-500">Failed to load learning paths.</p>
      )}

      <ul>
        {filteredLearningPaths.map((path) => (
          <li key={path.id} className="mb-2">
            <LPObjectSelector
              path={path}
              selectedComponentId={selectedComponentId}
              setSelectedComponentId={setSelectedComponentId}
            />
          </li>
        ))}
      </ul>

      {/* No Results Message */}
      {!isLoadingPaths &&
        !isErrorPaths &&
        filteredLearningPaths.length === 0 && (
          <p className="text-gray-500">No results found for "{searchTerm}".</p>
        )}
    </div>
  );
};

export default SelectLearningObject;
