import React, { useState, useMemo, useEffect, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLearningPath, fetchLearningObjectsByLearningPath } from '../../util/teacher/httpTeacher';
import { LearningPath } from '../../types/type';
import { LearningPathFilter } from '../../components/learningPath/learningPathFilter';
import { Filter, FilterType } from '../../components/ui/filters';
import { useParams } from 'react-router-dom';

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
const LearningPath: React.FC = () => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null);

    const { pathId } = useParams<{ pathId: string }>();

    const {
        data: learningPathData,
        isLoading,
        isError,
        error,
    } = useQuery<LearningPath>({
        queryKey: ['learningPaths', pathId],
        queryFn: () => fetchLearningPath(pathId!, true),
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
    });

    const {
        data: learningObjectsData,
        isLoading: isLoadingLearningObjects,
        isError: isErrorLearningObjects,
        error: errorLearningObjects,
    } = useQuery({
        queryKey: ['learningObjects', pathId],
        queryFn: () => fetchLearningObjectsByLearningPath(pathId!),
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
    });

    console.log('Learning Objects:', learningObjectsData);
    useEffect(() => {
        if (learningPathData) {
            setLearningPath(learningPathData);
        }
    }, [learningPathData]);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
                <h3 className="font-bold text-xl mb-4">Learning Objects</h3>
                {isLoadingLearningObjects ? (
                    <p>Loading learning objects...</p>
                ) : isErrorLearningObjects ? (
                    <p>Error: {errorLearningObjects.message}</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {learningObjectsData?.map((learningObject) => (
                            <button
                                key={learningObject.id}
                                className="text-left p-2 hover:bg-gray-200 rounded transition-colors"
                            >
                                {learningObject.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main content */}
            <div className="flex-1 p-8">
                <h2 className="font-bold text-5xl mb-8">
                    Learning Path Details
                </h2>
                {isLoading ? (
                    <p>Loading...</p>
                ) : isError ? (
                    <p>Error: {error.message}</p>
                ) : (
                    <div className="flex flex-col">
                        <h3 className="text-3xl">{learningPath?.title}</h3>
                        <p>{learningPath?.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningPath;
