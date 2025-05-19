import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LocalLearningObjectsPage from './LocalLearningObject';
import LearningPaths from '../learningPath/learningPaths';

const CustomContent: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'leerobjecten' | 'leerpaden'>(
    'leerobjecten',
  );

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
        {activeTab === 'leerpaden' && <LearningPaths ownedPathsOnly={true} />}
      </div>
    </div>
  );
};

export default CustomContent;
