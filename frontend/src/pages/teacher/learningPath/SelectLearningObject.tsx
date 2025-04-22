import React, { useEffect, useState } from 'react';
import { LearningObject } from '../../../types/type';
import { fetchLocalLearningObjects } from '../../../util/teacher/httpLearningPaths';
import { useQuery } from '@tanstack/react-query';
import { useLPEditContext } from '../../../context/LearningPathEditContext';

const SelectLearningObject: React.FC = () => {
  const { addNode, currentNodeIndex } = useLPEditContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredObjects, setFilteredObjects] = useState<LearningObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<LearningObject | null>(
    null,
  );

  const {
    data: localLearningObjects,
    isLoading,
    isError,
  } = useQuery<LearningObject[]>({
    queryKey: ['localLearningObjects'],
    queryFn: fetchLocalLearningObjects,
  });

  useEffect(() => {
    if (localLearningObjects) {
      const results = localLearningObjects.filter((object) =>
        object.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredObjects(results);
    }
  }, [searchTerm, localLearningObjects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); // Update the search term
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Select a Learning Object</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search learning objects..."
        value={searchTerm}
        onChange={handleInputChange}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      {/* Loading State */}
      {isLoading && <p>Loading...</p>}

      {/* Error State */}
      {isError && (
        <p className="text-red-500">Failed to load learning objects.</p>
      )}

      {/* Search Results */}
      <ul className="space-y-2">
        {filteredObjects.map((object: LearningObject) => (
          <React.Fragment key={object.id}>
            <li
              className={`p-4 border rounded cursor-pointer ${
                selectedObject?.id === object.id
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedObject(object)}
            >
              <h2 className="font-bold text-2xl">{object.title}</h2>
              <p className="text-m">{object.description}</p>
              <p className="text-sm">
                <strong>Language:</strong> {object.language}
              </p>
              <p className="text-sm">
                <strong>Difficulty:</strong> {object.difficulty}
              </p>
              <p className="text-sm">
                {object.keywords.length > 0 && (
                  <p className="text-sm">
                    <strong>Keywords:</strong> {object.keywords.join(', ')}
                  </p>
                )}
              </p>
              <p className="text-sm">
                <strong>Created:</strong>{' '}
                {new Date(object.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <strong>Last Updated:</strong>{' '}
                {new Date(object.updatedAt).toLocaleDateString()}
              </p>
              <p>todo: give option to view lo content</p>
            </li>

            {selectedObject?.id === object.id && (
              <button
                className={`px-5 h-9.5 font-bold rounded-md text-white bg-dwengo-blue-dark hover:bg-dwengo-blue hover:cursor-pointer`}
                onClick={() =>
                  addNode(object.id, object.title, currentNodeIndex)
                }
              >
                add learning object to path
              </button>
            )}
          </React.Fragment>
        ))}
      </ul>

      {/* No Results Message */}
      {!isLoading && !isError && filteredObjects.length === 0 && (
        <p className="text-gray-500">No results found for "{searchTerm}".</p>
      )}
    </div>
  );
};

export default SelectLearningObject;
