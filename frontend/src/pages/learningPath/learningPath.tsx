import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { LearningPath as LearningPathType, LearningObject } from '../../types/type';
import { useParams } from 'react-router-dom';
import {
  fetchLearningObjectsByLearningPath,
  fetchLearningPath,
} from '@/util/shared/learningPath';
import { useTranslation } from 'react-i18next';

import Sidebar from './Sidebar';
import MainContent from './MainContent';

const LearningPath: React.FC = () => {
  const { t } = useTranslation();
  const { pathId } = useParams<{ pathId: string }>();

  const [learningPath, setLearningPath] = useState<LearningPathType | null>(null);
  const [selectedLearningObject, setSelectedLearningObject] = useState<LearningObject | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isStudent = localStorage.getItem('role') === 'student';

  /* ----------------------------- React-Query ----------------------------- */
  const [
    {
      data: learningPathData,
      isLoading: isLoadingPath,
      isError: isErrorPath,
      error: errorPath,
    },
    {
      data: learningObjectsData,
      isLoading: isLoadingLO,
      isError: isErrorLO,
      error: errorLO,
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

  /* ----------------------------- Side effects ---------------------------- */
  useEffect(() => {
    if (learningPathData) setLearningPath(learningPathData);
    
  }, [learningPathData]);
  
  useEffect(() => {
    console.log(learningObjectsData);
    if (learningObjectsData) setSelectedLearningObject(learningObjectsData[0]);
  }, [learningObjectsData]);

  /* --------------------------- Derived helpers --------------------------- */
  const nextObject = useMemo(() => {
    if (!selectedLearningObject || !learningObjectsData) return null;
    const idx = learningObjectsData.findIndex(o => o.id === selectedLearningObject.id);
    return learningObjectsData[idx + 1] || null;
  }, [selectedLearningObject, learningObjectsData]);

  /* ------------------------------ Handlers ------------------------------- */
  const handleSelectLO = (lo: LearningObject | null) => {
    if (!lo) return;
    setSelectedLearningObject(lo);
    // Scroll naar boven van contentpane
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ----------------------------------------------------------------------- */
  return (
    <div className="flex h-screen">
      <Sidebar
        t={t}
        learningPath={learningPath}
        learningObjects={learningObjectsData}
        selectedLO={selectedLearningObject}
        progress={progress}
        isStudent={isStudent}
        isLoadingPath={isLoadingPath}
        isErrorPath={isErrorPath}
        errorPath={errorPath}
        isLoadingLO={isLoadingLO}
        isErrorLO={isErrorLO}
        errorLO={errorLO}
        onSelectLO={handleSelectLO}
      />

      <MainContent
        ref={contentRef}
        learningPath={learningPath}
        selectedLO={selectedLearningObject}
        nextLO={nextObject}
        onSelectLO={handleSelectLO}
        progress={progress}
        t={t}
      />
    </div>
  );
};

export default LearningPath;
