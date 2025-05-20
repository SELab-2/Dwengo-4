import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LocalLearningObjectsPage from './LocalLearningObject';
import { fetchOwnedLearningPaths } from '@/util/teacher/localLearningPaths';
import { LearningPath } from '@/types/type';
import { useQuery } from '@tanstack/react-query';
import { LearningPathCard } from '@/components/learningPath/LearningPathCard';
import { useNavigate } from 'react-router-dom';

const CustomContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'objects' | 'paths'>('objects');

  const {
    data: learningPaths,
    isLoading: isLoadingPaths,
    isError: isErrorPaths,
    error: errorPaths,
  } = useQuery<LearningPath[]>({
    queryKey: ['ownedLearningPaths'],
    queryFn: fetchOwnedLearningPaths,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-4">{t('custom_content.title')}</h1>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-300">
        <button
          className={`pb-2 text-sm font-medium hover:cursor-pointer ${
            activeTab === 'objects'
              ? 'text-dwengo-green border-b-2 border-dwengo-green'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('objects')}
        >
          {t('custom_content.los').toUpperCase()}
        </button>
        <button
          className={`pb-2 text-sm font-medium hover:cursor-pointer ${
            activeTab === 'paths'
              ? 'text-dwengo-green border-b-2 border-dwengo-green'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('paths')}
        >
          {t('custom_content.lps').toUpperCase()}
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'objects' && (
          <div>
            <LocalLearningObjectsPage />
          </div>
        )}
        {activeTab === 'paths' && (
          <div>
            {isLoadingPaths ? (
              <p>{t('learning_paths.loading')}</p>
            ) : isErrorPaths ? (
              <p>Error: {errorPaths.message}</p>
            ) : (
              <div className="flex flex-col items-start gap-6">
                {/* create learning path button */}
                <button
                  className={`
                    px-6 py-3 font-bold rounded-lg shadow-md hover:shadow-lg
                    text-white bg-dwengo-green hover:bg-dwengo-green-dark
                    max-w-xs
                  `}
                  onClick={() => {
                    navigate('/teacher/learning-paths/create');
                  }}
                >
                  <div className="flex items-center gap-2 bg-transparent">
                    {/* plus Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    {t('learning_paths.create_lp')}
                  </div>
                </button>

                {/* learning paths grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                  {learningPaths!.map((path) => (
                    <LearningPathCard key={path.id} path={path} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomContent;
