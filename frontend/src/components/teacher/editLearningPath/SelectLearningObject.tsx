import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LearningObject, LearningPath } from '../../../types/type';
import { useQuery } from '@tanstack/react-query';
import { fetchLearningPaths } from '@/util/shared/learningPath';
import { fetchOwnedLearningObjects } from '@/util/teacher/localLearningPaths';
import { LPObjectSelector } from '@/components/teacher/editLearningPath/LPObjectSelector';
import { useLPEditContext } from '@/context/LearningPathEditContext';
import { LOCard } from './LOCard';

const SelectLearningObject: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLearningPaths, setFilteredLearningPaths] = useState<
    LearningPath[]
  >([]);
  const [filteredObjects, setFilteredObjects] = useState<LearningObject[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  // user can select from learning paths or directly from their own learning objects
  const [viewMode, setViewMode] = useState<'paths' | 'objects'>('paths');
  const { language } = useLPEditContext();

  // fetch all learning paths, so that user can select learning objects from them
  const {
    data: allLearningPaths,
    isLoading: isLoadingPaths,
    isError: isErrorPaths,
  } = useQuery<LearningPath[]>({
    queryKey: ['learningPaths'],
    queryFn: fetchLearningPaths,
    staleTime: 5 * 60 * 1000, // consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // keep unused data in cache for 30 minutes
  });

  const {
    data: ownedLearningObjects,
    isLoading: isLoadingOwnedObjects,
    isError: isErrorOwnedObjects,
  } = useQuery<LearningObject[]>({
    queryKey: ['learningObjects'],
    queryFn: fetchOwnedLearningObjects,
    staleTime: 10 * 60 * 1000, // consider data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // keep unused data in cache for 30 minutes
  });

  useEffect(() => {
    if (allLearningPaths) {
      const results = allLearningPaths.filter((path) => {
        const matchesTitle = path.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesLanguage = !language || path.language === language;
        return matchesTitle && matchesLanguage;
      });
      setFilteredLearningPaths(results);
    }
  }, [searchTerm, allLearningPaths, language]);

  useEffect(() => {
    if (ownedLearningObjects) {
      const results = ownedLearningObjects.filter((object) => {
        const matchesTitle = object.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesLanguage = !language || object.language === language;
        return matchesTitle && matchesLanguage;
      });
      setFilteredObjects(results);
    }
  }, [searchTerm, ownedLearningObjects, language]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); // update the search term
  };

  // show correct message based on view mode, loading state, and error states
  const renderStateMessage = () => {
    const isLoading =
      (viewMode === 'paths' && isLoadingPaths) ||
      (viewMode === 'objects' && isLoadingOwnedObjects);
    const isError =
      (viewMode === 'paths' && isErrorPaths) ||
      (viewMode === 'objects' && isErrorOwnedObjects);
    const noResults =
      (viewMode === 'paths' && filteredLearningPaths.length === 0) ||
      (viewMode === 'objects' && filteredObjects.length === 0);

    if (isLoading) {
      return <p>{t(`edit_learning_path.select_lo.${viewMode}.loading`)}</p>;
    }
    if (isError) {
      return (
        <p className="text-red-500">
          {t(`edit_learning_path.select_lo.${viewMode}.error`)}
        </p>
      );
    }
    if (noResults) {
      return (
        <p className="text-gray-500">
          {searchTerm
            ? t('edit_learning_path.select_lo.no_results', { searchTerm })
            : t('edit_learning_path.select_lo.no_results_generic')}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">
        {t('edit_learning_path.select_lo.title')}
      </h1>

      {/* toggle between learning paths and learning objects */}
      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={() => setViewMode('paths')}
          className={`px-4 py-1.5 rounded hover:cursor-pointer ${
            viewMode === 'paths'
              ? 'bg-dwengo-green text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {t('edit_learning_path.select_lo.from_lps')}
        </button>
        <button
          onClick={() => setViewMode('objects')}
          className={`px-4 py-1.5 rounded hover:cursor-pointer ${
            viewMode === 'objects'
              ? 'bg-dwengo-green text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {t('edit_learning_path.select_lo.from_my_los')}
        </button>
      </div>

      {/* search input */}
      <input
        type="text"
        placeholder={`${
          viewMode === 'paths'
            ? t('edit_learning_path.select_lo.paths.search')
            : t('edit_learning_path.select_lo.objects.search')
        }`}
        value={searchTerm}
        onChange={handleInputChange}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      {/* show message if loading, error, or no results*/}
      {renderStateMessage()}

      {/* results */}
      <ul>
        {viewMode === 'paths' &&
          filteredLearningPaths.map((path) => (
            <li key={path.id} className="mb-2">
              <LPObjectSelector
                path={path}
                selectedComponentId={selectedComponentId}
                setSelectedComponentId={setSelectedComponentId}
              />
            </li>
          ))}

        {viewMode === 'objects' &&
          filteredObjects.map((object) => (
            <li key={object.id} className="text-sm mb-4">
              <LOCard
                object={object}
                isSelectedObject={selectedComponentId === object.id}
                setSelectedComponentId={setSelectedComponentId}
              />
            </li>
          ))}
      </ul>
    </div>
  );
};

export default SelectLearningObject;
