import React, { useState, useMemo, useEffect, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLearningPath, fetchLearningObjectsByLearningPath } from '../../util/teacher/httpTeacher';
import { LearningPath } from '../../types/type';
import { useParams } from 'react-router-dom';
import { LearningObject } from '@prisma/client'
import styles from './learningPath.module.css';
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
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
    const [selectedLearningObject, setSelectedLearningObject] = useState<LearningObject | null>(null);

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

    console.log('Learning Path:', learningPathData);

    useEffect(() => {
        if (learningPathData) {
            setLearningPath(learningPathData);
        }
    }, [learningPathData]);

    return (
        <div className="flex ">
            {/* Sidebar */}
            <div className="w-64 bg-gray-100 p-4 min-h-[calc(100vh-80px)]">
                {isLoadingLearningObjects ? (
                    <p>Loading learning objects...</p>
                ) : isErrorLearningObjects ? (
                    <p>Error: {errorLearningObjects.message}</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {learningObjectsData?.map((learningObject) => (
                            <button
                                key={learningObject.id}
                                className={`text-left p-2 hover:bg-gray-200 rounded transition-colors ${selectedLearningObject?.id === learningObject.id ? 'bg-gray-200' : ''
                                    }`}
                                onClick={() => setSelectedLearningObject(learningObject)}
                            >
                                {learningObject.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main content */}
            <div className="w-full pl-5">
                <div className="flex flex-col gap-8  pb-10 mt-8 w-fit mx-auto">

                    {!selectedLearningObject ? (
                        <>
                            <h3 className="text-6xl mx-auto text-center">{learningPath?.title}</h3>
                            <p className="mx-auto">{learningPath?.description}</p>
                        </>

                    ) : (
                        <div className="w-full max-w-3xl">
                            <h4 className="text-2xl mb-4">{selectedLearningObject.title}</h4>
                            <div
                                className="prose max-w-none [&_img]:max-w-[200px] [&_img]:max-h-[400px] [&_img]:object-contain"
                                dangerouslySetInnerHTML={{ __html: selectedLearningObject.raw || '' }}
                            />
                        </div>
                    )}

                </div>

            </div>


        </div>
    );
};

export default LearningPath;
