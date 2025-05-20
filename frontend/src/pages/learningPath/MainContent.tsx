import React, { forwardRef } from 'react';
import { LearningPath, LearningObject } from '../../types/type';
import LearningObjectContent from './learningObjectContent';

interface Props {
  learningPath: LearningPath | null;
  selectedLO: LearningObject | null;
  nextLO: LearningObject | null;
  onSelectLO: (lo: LearningObject | null) => void;
  progress: number;
  t: (key: string) => string;
}

const MainContent = forwardRef<HTMLDivElement, Props>(
  ({ learningPath, selectedLO, nextLO, onSelectLO, progress, t }, ref) => (
    <main
      ref={ref}
      className="border-l border-gray-200 w-full p-6 pb-[74px] max-h-[calc(100vh-80px)] overflow-y-auto relative"
    >
      {!selectedLO ? (
        <>
          <h3 className="w-fit mx-auto font-bold text-2xl">{learningPath?.title}</h3>
          <p className="py-2 pb-6 w-fit mx-auto">{learningPath?.description}</p>
        </>
      ) : (
        <div className="w-full max-w-3xl">
          <LearningObjectContent rawHtml={selectedLO.raw || ''} />

          <div className="mt-8 flex justify-end">
            <button
              className="
                px-4 py-2 text-base font-normal rounded bg-dwengo-blue text-white
                border-none cursor-pointer transition-opacity duration-200 disabled:opacity-50
                hover:bg-blue-600
              "
              disabled={progress === 100 || !nextLO}
              onClick={() => onSelectLO(nextLO)}
            >
              {nextLO ? `${t('learning_objects.next')}: ${nextLO.title}` : t('learning_objects.end')}
            </button>
          </div>
        </div>
      )}
    </main>
  ),
);

export default MainContent;
