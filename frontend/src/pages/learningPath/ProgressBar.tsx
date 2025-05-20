import React from 'react';
import clsx from 'clsx';

interface Props {
  progress: number;
  className?: string;
}

const ProgressBar: React.FC<Props> = ({ progress, className }) => (
  <div className={clsx('flex items-center gap-2 bg-transparent', className)}>
    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-600 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
  </div>
);

export default ProgressBar;
