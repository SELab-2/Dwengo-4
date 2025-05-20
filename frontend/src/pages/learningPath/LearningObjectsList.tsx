import React from 'react';
import { LearningObject } from '../../types/type';

interface Props {
  t: (key: string) => string;
  learningObjects?: LearningObject[];
  selectedLO: LearningObject | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
  onSelectLO: (lo: LearningObject | null) => void;
}

const LearningObjectsList: React.FC<Props> = ({
  t,
  learningObjects,
  selectedLO,
  isLoading,
  isError,
  error,
  onSelectLO,
}) => (
  <div className="rounded-md border border-gray-200 overflow-hidden">
    {isLoading ? (
      <p className="p-4">{t('learning_objects.loading')}</p>
    ) : isError ? (
      <p className="p-4">Error: {error.message}</p>
    ) : (
      <div className="flex flex-col overflow-y-auto">
        {learningObjects?.map((lo) => (
          <button
            key={lo.id}
            onClick={() => onSelectLO(lo)}
            className={`
              p-4 text-base border-b border-gray-200 text-left
              transition-colors duration-200 hover:cursor-pointer
              ${
                lo.teacherExclusive
                  ? 'bg-dwengo-green-transparent-light hover:bg-dwengo-green-transparent-dark'
                  : 'hover:bg-gray-100'
              }
              ${selectedLO?.id === lo.id ? 'inset-shadow-sm ' : ''}
            `}
          >
            <div
              className={`
                flex items-center justify-between bg-transparent
                ${
                  selectedLO?.id === lo.id
                    ? 'font-extrabold font-medium border-l-[4px] border-l-black pl-4'
                    : ''
                }
              `}
            >
              <span>{lo.title}</span>
              {lo.estimatedTime && (
                <span className="text-base pr-2">{lo.estimatedTime}&apos;</span>
              )}
              {/* (Icon voor done-status kan hier, zie TODO in origineel) */}
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

export default LearningObjectsList;
