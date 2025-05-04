import { useLPEditContext } from '@/context/LearningPathEditContext';
import { LearningObject } from '@/types/type';
import React, { memo } from 'react';

interface LOCardProps {
  object: LearningObject;
  isSelectedObject: boolean;
  setSelectedComponentId: (id: string) => void;
}

export const LOCard: React.FC<LOCardProps> = memo(
  ({ object, isSelectedObject, setSelectedComponentId }) => {
    const { addNode, currentNodeIndex } = useLPEditContext();
    return (
      <div
        className={`p-4 border rounded cursor-pointer ${
          isSelectedObject ? 'bg-blue-100' : 'hover:bg-gray-100'
        }`}
        onClick={() => setSelectedComponentId(object.id)} // Toggle selection
      >
        <h2 className="font-bold text-2xl">{object.title}</h2>
        <p className="text-m">{object.description}</p>
        <p className="text-sm">
          <strong>Language:</strong> {object.language}
        </p>
        <p className="text-sm">
          <strong>Difficulty:</strong> {object.difficulty}
        </p>
        {object.keywords.length > 0 && (
          <p className="text-sm">
            <strong>Keywords:</strong> {object.keywords.join(', ')}
          </p>
        )}
        <p className="text-sm">
          <strong>Created:</strong>{' '}
          {new Date(object.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm">
          <strong>Last Updated:</strong>{' '}
          {new Date(object.updatedAt).toLocaleDateString()}
        </p>
        <p>todo: give option to view lo content</p>

        {isSelectedObject && (
          <button
            className={`px-5 h-9.5 font-bold rounded-md text-white bg-dwengo-blue-dark hover:bg-dwengo-blue hover:cursor-pointer`}
            onClick={() =>
              object.origin === 'dwengo'
                ? addNode(
                    object.title,
                    currentNodeIndex,
                    undefined,
                    object.hruid,
                    object.language,
                    object.version,
                  )
                : addNode(object.title, currentNodeIndex, object.id)
            }
          >
            Add learning object to path
          </button>
        )}
      </div>
    );
  },
);
