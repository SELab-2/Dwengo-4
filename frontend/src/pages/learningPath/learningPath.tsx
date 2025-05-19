import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { LearningPath, LearningObject } from '../../types/type';
import { useParams } from 'react-router-dom';
import {
  fetchLearningObjectsByLearningPath,
  fetchLearningPath,
} from '@/util/shared/learningPath';
//import { upsertLearningObjectProgress } from '@/util/student/progress';
import { useTranslation } from 'react-i18next';
import LearningObjectContent from './learningObjectContent';

/**
 * LearningPaths component displays all available learning paths.
 *
 * Features:
 * - Fetches and displays all learning paths
 * - Shows title and description for each path
 * - Provides links to individual learning paths
 * - Handles loading and error states
 *
 * @component
 * @returns {JSX.Element} The rendered LearningPaths component
 */
const LearningPath: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const contentRef = useRef<HTMLDivElement>(null); // ref for the learning object content container
  const [selectedLearningObject, setSelectedLearningObject] =
    useState<LearningObject | null>(null);
  const { pathId } = useParams<{ pathId: string }>();
  const [progress, setProgress] = useState<number>(0);
  const isStudent = localStorage.getItem('role') === 'student';

  const [
    {
      data: learningPathData,
      isLoading: isLoadingPath,
      isError: isErrorPath,
      error: errorPath,
    },
    {
      data: learningObjectsData,
      isLoading: isLoadingLearningObjects,
      isError: isErrorLearningObjects,
      error: errorLearningObjects,
    },
  ] = useQueries({
    queries: [
      {
        queryKey: ['learningPaths', pathId],
        queryFn: () => fetchLearningPath(pathId!),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      },
      {
        queryKey: ['learningObjects', pathId],
        queryFn: () => fetchLearningObjectsByLearningPath(pathId!),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      },
    ],
  });

  const nextObject = useMemo(() => {
    if (!selectedLearningObject || !learningObjectsData) return null;
    const idx = learningObjectsData.findIndex(
      (o) => o.id === selectedLearningObject.id,
    );
    return learningObjectsData[idx + 1] || null;
  }, [selectedLearningObject, learningObjectsData]);
  const { t } = useTranslation();

  useEffect(() => {
    if (learningPathData) {
      setLearningPath(learningPathData);
    }
  }, [learningPathData]);

  // select first learning object by default after loading
  useEffect(() => {
    if (learningObjectsData) {
      setSelectedLearningObject(learningObjectsData[0]);
    }
  }, [learningObjectsData]);

  /*
  useEffect(() => {
    if (isStudent && learningPath) {
      calculateProgress();
    }
  }, [learningPath]);

  const calculateProgress = () => {
    if (!learningPath) return 0;
    const totalNodes = learningPath.nodes.length;
    const completedNodes = learningPath.nodes.filter(
      (node) => node.done,
    ).length;

    setProgress((completedNodes / totalNodes) * 100);
  };
  */

  // Handle click on learning object
  const handleClickLearningObject = async (
    learningObject: LearningObject | null,
  ) => {
    // if (selectedLearningObject && isStudent) {
    //   await upsertLearningObjectProgress(selectedLearningObject!.id, true);
    //   learningPath!.nodes.find(
    //     (obj) => obj.localLearningObjectId === selectedLearningObject!.id,
    //   )!.done = true;
    //   calculateProgress();
    // }
    if (!learningObject) return;

    // scroll to top of content
    setSelectedLearningObject(learningObject);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  console.log('progress', progress);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="p-4 space-y-5 max-w-[405px] w-full overflow-y-scroll bg-white">
        {/* path details */}
        {isLoadingPath ? (
          <p>{t('lp_view.loading_path_details')}</p>
        ) : isErrorPath ? (
          <p>Error: {errorPath.message}</p>
        ) : (
          <div className="flex gap-2.5 bg-transparent">
            <h2 className="text-xl font-bold">{learningPath?.title}</h2>
            {isStudent && (
              <div className="flex items-center gap-2 ml-auto bg-transparent">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-col items-start bg-transparent">
          <div className="flex gap-3 bg-transparent">
            <div className="w-5 h-5 bg-dwengo-green-transparent-light border-1 border-gray-400"></div>
            <span className="text-sm italic text-gray-600">
              {t('lp_view.legend.teacher_exclusive')}
            </span>
          </div>
          <div className="flex gap-3 bg-transparent">
            <div className="w-5 h-5 border-b-1 border-x-1 border-gray-400"></div>
            <span className="text-sm italic text-gray-600">
              {t('lp_view.legend.student_content')}
            </span>
          </div>
        </div>

        {/* learning objects list */}
        <div className="rounded-md border border-gray-200 overflow-hidden">
          {isLoadingLearningObjects ? (
            <p className="p-4">{t('learning_objects.loading')}</p>
          ) : isErrorLearningObjects ? (
            <p className="p-4">Error: {errorLearningObjects.message}</p>
          ) : (
            <div className="flex flex-col overflow-y-auto">
              {learningObjectsData?.map((learningObject) => (
                <button
                  className={`
                        p-4 text-base border-b border-gray-200 text-left
                        transition-colors duration-200 hover:cursor-pointer
                        ${
                          learningObject.teacherExclusive
                            ? 'bg-dwengo-green-transparent-light hover:bg-dwengo-green-transparent-dark'
                            : 'hover:bg-gray-100'
                        }
                        ${
                          selectedLearningObject?.id === learningObject.id
                            ? 'inset-shadow-sm '
                            : ''
                        }
                      `}
                  key={learningObject.id}
                  onClick={() => handleClickLearningObject(learningObject)}
                >
                  <div
                    className={`
                    flex items-center justify-between bg-transparent
                    ${
                      selectedLearningObject?.id === learningObject.id
                        ? 'font-extrabold font-medium border-l-[4px] border-l-black pl-4'
                        : ''
                    }
                  `}
                  >
                    <span>{learningObject.title}</span>
                    {learningObject.estimatedTime && (
                      <span className="text-base pr-2">
                        {learningObject.estimatedTime}&apos;
                      </span>
                    )}
                    {/* Doesn't work yet
                      <svg
                        className={`w-5 h-5 ${learningObject.done ? 'text-green-500' : 'text-gray-300'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {learningPathData?.nodes.find(
                          (node) =>
                            node.localLearningObjectId === learningObject.id &&
                            node.done,
                        ) ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                            color="green"
                          />
                        ) : (
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            strokeWidth={2}
                            color="gray"
                          />
                        )}
                      </svg>
                    */}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div
        ref={contentRef}
        className="border-l border-gray-200 w-full p-6 pb-[74px] max-h-[calc(100vh-80px)] overflow-y-auto relative"
      >
        <div className="header">
          {!selectedLearningObject ? (
            <>
              <h3 className="w-fit mx-auto font-bold text-2xl">
                {learningPath?.title}
              </h3>
              <p className="py-2 pb-6 w-fit mx-auto">
                {learningPath?.description}
              </p>
            </>
          ) : (
            <>
              <div className="w-full max-w-3xl">
                <LearningObjectContent
                  rawHtml={selectedLearningObject.raw || ''}
                />

                <div className="mt-8 flex justify-end">
                  <button
                    className={`
                    px-4 py-2 text-base font-normal rounded bg-dwengo-blue text-white
                    border-none cursor-pointer transition-opacity duration-200 disabled:opacity-50
                    hover:bg-blue-600
                  `}
                    onClick={() => {
                      handleClickLearningObject(nextObject);
                    }}
                    disabled={progress === 100 || !nextObject}
                  >
                    {nextObject
                      ? `${t('learning_objects.next')}: ${nextObject.title}`
                      : t('learning_objects.end')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
