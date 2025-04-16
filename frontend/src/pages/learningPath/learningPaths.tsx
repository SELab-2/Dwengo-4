import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLearningPaths } from '../../util/teacher/httpTeacher';
import { LearningPath } from '../../types/type';
import { LearningPathFilter } from '../../components/learningPath/learningPathFilter';
import { Filter, FilterType } from '../../components/ui/filters';

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
    const [filteredPaths, setFilteredPaths] = useState<LearningPath[]>([]);
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
        return Array.from(new Set(learningPaths
            .filter(path => path.creator?.user !== undefined)
            .map(path => ({
                name: `${path.creator?.user.firstName} ${path.creator?.user.lastName}`
            }))))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [learningPaths]);

    const filteredResults = useMemo(() => {
        if (!learningPaths) return [];
        return learningPaths.filter(path => {
            // First check the search query
            if (searchQuery && !path.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // If no filters are applied, show all paths that match the search
            if (filters.length === 0) return true;
            // Check if path matches all active filters
            return filters.every(filter => {
                switch (filter.type) {
                    case FilterType.LANGUAGE:
                        if (filter.value.length === 0) return true;
                        // Check if the path's language matches the selected languages
                        if (path.language === null) return false; // Handle null language
                        // Check if any of the selected languages match the path's language
                        return filter.value.length === 0 || filter.value.includes(path.language);
                    case FilterType.CREATED_DATE:
                        if (filter.value.length === 0) return true;
                        const pathDate = new Date(path.createdAt);
                        if (isNaN(pathDate.getTime())) return false; // Invalid date
                        const now = new Date();
                        const diffDays = Math.floor((now.getTime() - pathDate.getTime()) / (1000 * 60 * 60 * 24));

                        return filter.value.some(value => {
                            switch (value) {
                                case 'week': return diffDays <= 7;
                                case 'month': return diffDays <= 30;
                                case 'year': return diffDays <= 365;
                                default: return true;
                            }
                        });
                    case FilterType.CREATOR:
                        if (filter.value.length === 0) return true;
                        if (!path.creator?.user?.firstName || !path.creator?.user?.lastName) return false;
                        const creatorFullName = `${path.creator.user.firstName} ${path.creator.user.lastName}`;
                        // Check if any of the selected creators match the path's creator full name
                        return filter.value.some(v => creatorFullName === v);

                    default:
                        return true;
                }
            });
        });
    }, [learningPaths, filters, searchQuery]);

    useEffect(() => {
        setFilteredPaths(filteredResults);
    }, [filteredResults]);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Learning Paths</h1>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded-lg mb-4 w-full md:w-1/3"
                />
                <LearningPathFilter
                    filters={filters}
                    setFilters={setFilters}
                    creators={uniqueCreators}
                />
            </div>

            {isLoading && <p className="text-gray-600">Loading...</p>}
            {isError && <p className="text-red-500">Error: {error.message}</p>}

            {!isLoading && !isError && filteredPaths.length === 0 ? (
                <p className="text-gray-600">No learning paths found matching your filters.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-10/12 mx-auto">
                    {filteredPaths.map((path) => (
                        <div key={path.id} className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-120">
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
                                        style={{
                                            backgroundColor: `hsl(${Math.random() * 360}, 70%, 80%)`
                                        }}
                                    >
                                        <span className="text-gray-700 text-xl font-semibold">
                                            {path.title}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-grow h-40 border-t-2 border-gray-200">
                                <a
                                    href={`/learning-path/${path.id}`}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <h2 className="text-xl font-semibold mb-2">{path.title}</h2>
                                </a>
                                <p className="text-gray-700">{path.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LearningPaths;
