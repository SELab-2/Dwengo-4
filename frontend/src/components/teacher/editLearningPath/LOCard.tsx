import { useLPEditContext } from '@/context/LearningPathEditContext';
import LearningObjectContent from '@/pages/learningPath/learningObjectContent';
import { LearningObject } from '@/types/type';
import React, { memo, useState } from 'react';
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
    const [isContentVisible, setIsContentVisible] = useState(false);

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
          <strong>
            {t('edit_learning_path.lo_card.teacher_exclusive.label')}
          </strong>
          <span className="ml-1">
            {object.teacherExclusive
              ? t('edit_learning_path.lo_card.teacher_exclusive.true')
              : t('edit_learning_path.lo_card.teacher_exclusive.false')}
          </span>
        </p>
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

        {isSelectedObject && (
          <button
            className={`px-5 h-9.5 mt-2 mb-1 font-bold rounded-md text-white bg-dwengo-blue-dark hover:bg-dwengo-blue hover:cursor-pointer`}
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

        {/* arrow icon to toggle content */}
        <div
          className="flex mt-2 items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering the parent onClick
            setIsContentVisible(!isContentVisible);
          }}
          title={t('edit_learning_path.lo_card.toggle_content')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={`w-5 h-5 text-gray-700 transition-transform duration-200 ${
              isContentVisible ? 'rotate-180' : ''
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>

        {/* Conditionally render the LearningObjectContent component */}
        {isContentVisible && (
          <div className="mt-4 p-2 bg-gray-50 border rounded prose prose-xl">
            <LearningObjectContent rawHtml={object.raw || ''} />
          </div>
        )}
      </div>
    );
  },
);
