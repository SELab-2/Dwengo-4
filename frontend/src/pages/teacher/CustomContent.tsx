import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LocalLearningObjectsPage from './LocalLearningObject';
import { fetchOwnedLearningPaths } from '@/util/teacher/localLearningPaths';
import { LearningPath } from '@/types/type';
import { useQuery } from '@tanstack/react-query';
import { LearningPathCard } from '@/components/learningPath/LearningPathCard';

const CustomContent: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'leerobjecten' | 'leerpaden'>(
    'leerobjecten',
  );

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
            activeTab === 'leerobjecten'
              ? 'text-dwengo-green border-b-2 border-dwengo-green'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('leerobjecten')}
        >
          {t('custom_content.los').toUpperCase()}
        </button>
        <button
          className={`pb-2 text-sm font-medium hover:cursor-pointer ${
            activeTab === 'leerpaden'
              ? 'text-dwengo-green border-b-2 border-dwengo-green'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('leerpaden')}
        >
          {t('custom_content.lps').toUpperCase()}
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'leerobjecten' && (
          <div>
            <LocalLearningObjectsPage />
          </div>
        )}
        {activeTab === 'leerpaden' && (
          <div>
            {isLoadingPaths ? (
              <p>{t('loading')}</p>
            ) : isErrorPaths ? (
              <p>{t('error.loading_paths', { error: errorPaths })}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-10/12 mx-auto">
                {learningPaths!.map((path) => (
                  <LearningPathCard key={path.id} path={path} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomContent;
