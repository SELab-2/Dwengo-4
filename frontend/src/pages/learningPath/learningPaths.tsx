import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LearningPath } from '../../types/type';
import { LearningPathFilter } from '../../components/learningPath/learningPathFilter';
import { Filter } from '../../components/ui/filters';
import { Link } from 'react-router-dom';
import { filterLearningPaths } from '@/util/filter';
import { fetchLearningPaths } from '@/util/shared/learningPath';
import { useTranslation } from 'react-i18next';

/**
 * Generates a background color based on the given ID.
 *
 * @param {string} id - The ID to generate the background color for.
 * @returns {string} The generated background color in HSL format.
 */
const generateBackgroundColor = (id: string) => {
  const hash = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

interface LearningPathCardProps {
  path: LearningPath;
}

/**
 * LearningPathCard component displays a single learning path card.
 *
 * @param {LearningPathCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered LearningPathCard component.
 */
const LearningPathCard: React.FC<LearningPathCardProps> = ({ path }) => {
  const backgroundColor = useMemo(
    () => generateBackgroundColor(path.id),
    [path.id],
  );
  const isTeacherView = window.location.pathname.includes('/teacher');
  const linkPath = isTeacherView
    ? `/teacher/learning-path/${path.id}`
    : `/student/learning-path/${path.id}`;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-128">
      <div className="w-full h-80 flex items-center justify-center">
        {path.image ? (
          <img
            src={`data:image/png;base64,${path.image}`}
            alt={`${path.title} thumbnail`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center object-fit-cover"
            style={{ backgroundColor }}
          >
            <span className="text-gray-700 text-xl font-semibold">
              {path.title}
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex-grow h-40 border-t-2 border-gray-200">
        <Link to={linkPath} className="text-blue-600 hover:text-blue-800">
          <h2 className="text-xl font-semibold mb-2">{path.title}</h2>
        </Link>
        <p className="text-gray-700 h-[77px] overflow-hidden line-clamp-3">
          {path.description}
        </p>
      </div>
    </div>
  );
};

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
    return Array.from(
      new Set(
        learningPaths
          .filter((path) => path.creator?.user !== undefined)
          .map((path) => ({
            name: `${path.creator?.user.firstName} ${path.creator?.user.lastName}`,
          })),
      ),
    ).sort((a, b) => a.name.localeCompare(b.name));
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('learning_paths.label')}</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder={t('learning_paths.search_name')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-lg mb-4 w-full md:w-1/3"
        />
        <LearningPathFilter
          filters={filters}
          setFilters={setFilters}
          creators={uniqueCreators}
          languages={uniqueLanguages}
        />
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
