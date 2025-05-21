/* MainContent.tsx */
import React, { forwardRef, useMemo } from 'react';
import { LearningPath, LearningObject } from '../../types/type';
import LearningObjectContent from './learningObjectContent';

interface Props {
  learningPath: LearningPath | null;
  selectedLO: LearningObject | null;
  nextLO: LearningObject | null;
  onSelectLO: (lo: LearningObject | null) => void;
  /** Komt uit MultipleChoiceQuestion → keuze-index voor transitions */
  onChooseTransition: (choiceIndex: number) => void;
  progress: number;
  /** Voor terugkeer: bewaar eerdere keuze */
  initialSelectedIdx?: number;

  t: (key: string) => string;
}

const MainContent = forwardRef<HTMLDivElement, Props>(
  (
    {
      learningPath,
      selectedLO,
      nextLO,
      onSelectLO,
      onChooseTransition,
      progress,
      initialSelectedIdx,
      t,
    },
    ref,
  ) => {
    // Detecteer of rawHtml een multiple choice vraag bevat
    const isMC = useMemo(() => {
      if (!selectedLO?.raw) return false;
      try {
        const data = JSON.parse(selectedLO.raw);
        return Array.isArray(data.options) && data.options.length > 0;
      } catch {
        return false;
      }
    }, [selectedLO]);

    return (
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
            {/* Key op nodeId forceren remount van de vraag */}
            {(() => {
              const node = learningPath?.nodes.find(
                n => n.localLearningObjectId === selectedLO.id
              );
              const key = node?.nodeId ?? selectedLO.id;
              return (
                <LearningObjectContent
                  key={key}
                  rawHtml={selectedLO.raw || ''}
                  onChooseTransition={onChooseTransition}
                  initialSelectedIdx={initialSelectedIdx}
                />
              );
            })()}

            {/* Button alleen tonen als het géén multiple choice vraag is */}
            {(!isMC || nextLO) ? (
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
                  {nextLO
                    ? `${t('learning_objects.next')}: ${nextLO.title}`
                    : t('learning_objects.end')}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </main>
    );
  },
);

export default MainContent;
