import React, { useState, useMemo, useEffect, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLearningPath, fetchLearningObjectsByLearningPath } from '../../util/teacher/httpTeacher';
import { LearningPath } from '../../types/type';
import { useParams } from 'react-router-dom';
import { LearningObject } from '@prisma/client';

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

    console.log('learningObjectsData', learningObjectsData);
    console.log('learningPathData', learningPathData);

    const getNextLearningObject = () => {
        if (!selectedLearningObject || !learningObjectsData) return null;
        const currentIndex = learningObjectsData.findIndex(obj => obj.id === selectedLearningObject.id);
        return learningObjectsData[currentIndex + 1] || null;
    };

    const handleNextClick = () => {
        const nextObject = getNextLearningObject();
        if (nextObject) {
            setSelectedLearningObject(nextObject);
        }
    };

    useEffect(() => {
        if (learningPathData) {
            setLearningPath(learningPathData);
        }
    }, [learningPathData]);

    return (
        <div className="flex max-h-[calc(100vh-80px)]">
            {/* Sidebar */}
            <div className="p-4 max-w-[416px] w-full bg-gray-50  max-h-[calc(100vh-80px)] min-h-[calc(100vh-80px)] overflow-y-scroll ">
                <div className="rounded-lg border border-gray-200 p-2.5 bg-white">
                    {isLoadingLearningObjects ? (
                        <p>Loading learning objects...</p>
                    ) : isErrorLearningObjects ? (
                        <p>Error: {errorLearningObjects.message}</p>
                    ) : (
                        <>
                            <div className="flex gap-2.5 -m-2.5 p-2.5 border-b border-gray-200">
                                <h2 className="text-xl font-bold">{learningPath?.title}</h2>
                            </div>
                            <div className="flex flex-col">
                                {learningObjectsData?.map((learningObject) => (
                                    <button
                                        className={`p-4 text-base font-normal border-b border-gray-200 text-left bg-transparent transition-colors duration-200 ${selectedLearningObject?.id === learningObject.id
                                            ? 'bg-blue-50 text-blue-600 font-medium border-l-[3px] border-l-blue-600'
                                            : ''
                                            }`}
                                        key={learningObject.id}
                                        onClick={() => setSelectedLearningObject(learningObject)}
                                    >
                                        {learningObject.title}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="border-l border-gray-200 w-full p-6 pb-[74px] max-h-[calc(100vh-80px)] overflow-y-scroll">
                <div className="header">
                    {!selectedLearningObject ? (
                        <>
                            <h3 className="w-fit mx-auto font-bold text-2xl">{learningPath?.title}</h3>
                            <p className="py-2 pb-6 w-fit mx-auto">{learningPath?.description}</p>
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
                <div className="fixed bottom-0 right-0 flex p-4 justify-end border-t border-l border-gray-200 bg-white w-[calc(100%-416px)] z-10">
                    <button
                        className="px-4 py-2 text-base font-normal rounded bg-blue-600 text-white border-none cursor-pointer transition-opacity duration-200 disabled:opacity-50"
                        onClick={handleNextClick}
                        disabled={!getNextLearningObject()}
                    >
                        {getNextLearningObject()
                            ? `Up Next: ${getNextLearningObject()?.title}`
                            : 'End of Path'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
