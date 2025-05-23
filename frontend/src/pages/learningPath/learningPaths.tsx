import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LearningPath } from '../../types/type';
import { LearningPathFilter } from '../../components/learningPath/learningPathFilter';
import { Filter } from '../../components/ui/filters';
import { filterLearningPaths } from '@/util/filter';
import { fetchLearningPaths } from '@/util/shared/learningPath';
import { useTranslation } from 'react-i18next';
import { LearningPathCard } from '@/components/learningPath/LearningPathCard';
import CreateLPButton from '@/components/teacher/editLearningPath/CreateLPButton';

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
const LearningPaths: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: learningPaths,
    isLoading,
    isError,
    error,
  } = useQuery<LearningPath[]>({
    queryKey: ['learningPaths'],
    queryFn: fetchLearningPaths,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
  });

  const uniqueCreators = useMemo(() => {
    if (!learningPaths) return [];
    const creators = new Set(
      learningPaths
        .filter((path) => path.creator !== undefined)
        .map((path) => `${path.creator?.firstName} ${path.creator?.lastName}`),
    );
    return Array.from(creators)
      .map((creator) => ({
        name: creator,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [learningPaths]);

  const uniqueLanguages = useMemo(() => {
    if (!learningPaths) return [];
    const languages = new Set(
      learningPaths
        .filter((path) => path.language !== null && path.language !== undefined)
        .map((path) => path.language),
    );
    return Array.from(languages)
      .map((language) => ({
        name: language,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [learningPaths]);

  const filteredResults = useMemo(
    () => filterLearningPaths(learningPaths || [], filters, searchQuery),
    [learningPaths, filters, searchQuery],
  );

  const { t } = useTranslation();

  const isTeacherView = window.location.pathname.includes('/teacher');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('learning_paths.label')}</h1>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
        {/* search bar and filter*/}
        <div className="flex flex-col w-full md:w-1/3 gap-2">
          <input
            type="text"
            placeholder={t('learning_paths.search_name')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-lg w-full"
          />

          <LearningPathFilter
            filters={filters}
            setFilters={setFilters}
            creators={uniqueCreators}
            languages={uniqueLanguages}
          />
        </div>

        {isTeacherView && <CreateLPButton />}
      </div>

      {isLoading && <p className="text-gray-600">{t('loading.loading')}</p>}
      {isError && <p className="text-red-500">Error: {error.message}</p>}

      {!isLoading &&
        !isError &&
        (filteredResults.length === 0 ? (
          <p className="text-gray-600">
            {t('learning_paths.not_found_filter')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-10/12 mx-auto">
            {filteredResults.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        ))}
    </div>
  );
};

export default LearningPaths;
