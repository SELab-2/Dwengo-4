import React from 'react';
import { LearningPath, LearningObject } from '../../types/type';
import PathHeader from './PathHeader';
import Legend from './Legend';
import LearningObjectsList from './LearningObjectsList';

interface Props {
  t: (key: string) => string;
  learningPath: LearningPath | null;
  learningObjects?: LearningObject[];
  selectedLO: LearningObject | null;
  progress: number;
  isStudent: boolean;
  isLoadingPath: boolean;
  isErrorPath: boolean;
  errorPath: any;
  isLoadingLO: boolean;
  isErrorLO: boolean;
  errorLO: any;
  onSelectLO: (lo: LearningObject | null) => void;
}

const Sidebar: React.FC<Props> = ({
  t,
  learningPath,
  learningObjects,
  selectedLO,
  progress,
  isStudent,
  isLoadingPath,
  isErrorPath,
  errorPath,
  isLoadingLO,
  isErrorLO,
  errorLO,
  onSelectLO,
}) => (
  <aside className="p-4 space-y-5 max-w-[405px] w-full overflow-y-scroll bg-white">
    <PathHeader
      t={t}
      learningPath={learningPath}
      isLoading={isLoadingPath}
      isError={isErrorPath}
      error={errorPath}
      progress={progress}
      isStudent={isStudent}
    />

    <Legend t={t} />

    <LearningObjectsList
      t={t}
      learningObjects={learningObjects}
      selectedLO={selectedLO}
      isLoading={isLoadingLO}
      isError={isErrorLO}
      error={errorLO}
      onSelectLO={onSelectLO}
    />
  </aside>
);

export default Sidebar;
