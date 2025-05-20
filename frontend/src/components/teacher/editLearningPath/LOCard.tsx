import { useLPEditContext } from '@/context/LearningPathEditContext';
import { LearningObject } from '@/types/type';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface LOCardProps {
  object: LearningObject;
  isSelectedObject: boolean;
  setSelectedComponentId: (id: string) => void;
}

export const LOCard: React.FC<LOCardProps> = memo(
  ({ object, isSelectedObject, setSelectedComponentId }) => {
    const { t } = useTranslation();
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
          <strong>{t('edit_learning_path.lo_card.language')}</strong>
          <span className="ml-1">{object.language}</span>
        </p>
        <p className="text-sm">
          <strong>{t('edit_learning_path.lo_card.difficulty')}</strong>
          <span className="ml-1">{object.difficulty}</span>
        </p>
        {object.keywords.length > 0 && (
          <p className="text-sm">
            <strong>{t('edit_learning_path.lo_card.keywords')}</strong>
            <span className="ml-1">{object.keywords.join(', ')}</span>
          </p>
        )}
        <p className="text-sm">
          <strong>{t('edit_learning_path.lo_card.created')}</strong>
          <span className="ml-1">
            {new Date(object.createdAt).toLocaleDateString()}
          </span>
        </p>
        <p className="text-sm">
          <strong>{t('edit_learning_path.lo_card.updated')}</strong>
          <span className="ml-1">
            {new Date(object.updatedAt).toLocaleDateString()}
          </span>
        </p>
        <p>todo: give option to view lo content</p>

        {isSelectedObject && (
          <button
            className={`px-5 h-9.5 font-bold rounded-md text-white bg-dwengo-blue-dark hover:bg-dwengo-blue hover:cursor-pointer`}
            onClick={() =>
              addNode(
                object.title,
                currentNodeIndex,
                object.hruid,
                object.language,
                object.version,
                object.origin === 'dwengo' ? undefined : object.id,
              )
            }
          >
            {t('edit_learning_path.lo_card.add_to_path')}
          </button>
        )}
      </div>
    );
  },
);
