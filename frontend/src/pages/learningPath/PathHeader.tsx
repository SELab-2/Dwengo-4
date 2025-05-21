import React from 'react';
import { LearningPath } from '../../types/type';
import ProgressBar from './ProgressBar';

interface Props {
  t: (key: string) => string;
  learningPath: LearningPath | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
  progress: number;
  isStudent: boolean;
}

const PathHeader: React.FC<Props> = ({
  t,
  learningPath,
  isLoading,
  isError,
  error,
  progress,
  isStudent,
}) => {
  if (isLoading) return <p>{t('lp_view.loading_path_details')}</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div className="flex gap-2.5 bg-transparent">
      <h2 className="text-xl font-bold">{learningPath?.title}</h2>
      {isStudent && (
        <ProgressBar progress={progress} className="ml-auto" />
      )}
    </div>
  );
};

export default PathHeader;
