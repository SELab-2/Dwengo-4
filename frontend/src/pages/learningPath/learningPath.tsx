import React, { useState, useMemo, useEffect, use } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { LearningPath } from '../../types/type';
import { useParams } from 'react-router-dom';
import { LearningObject } from '@prisma/client';
import { fetchLearningObjectsByLearningPath, fetchLearningPath } from '@/util/shared/learningPath';
import { upsertLearningObjectProgress } from '@/util/student/progress';

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
    const [progress, setProgress] = useState<number>(0);
    const [isStudent, setIsStudent] = useState<boolean>(localStorage.getItem('role') === 'student');
    const [
        { data: learningPathData, isLoading, isError, error },
        { data: learningObjectsData, isLoading: isLoadingLearningObjects, isError: isErrorLearningObjects, error: errorLearningObjects },
    ] = useQueries({
        queries: [
            {
                queryKey: ['learningPaths', pathId],
                queryFn: () => fetchLearningPath(pathId!, true),
                staleTime: 5 * 60 * 1000,
                gcTime: 30 * 60 * 1000,
            },
            {
                queryKey: ['learningObjects', pathId],
                queryFn: () => fetchLearningObjectsByLearningPath(pathId!),
                staleTime: 5 * 60 * 1000,
                gcTime: 30 * 60 * 1000,
            },
        ]
    });

    const nextObject = useMemo(() => {
        if (!selectedLearningObject || !learningObjectsData) return null;
        const idx = learningObjectsData.findIndex(o => o.id === selectedLearningObject.id);
        return learningObjectsData[idx + 1] || null;
    }, [selectedLearningObject, learningObjectsData]);

    useEffect(() => {
        if (learningPathData) {
            setLearningPath(learningPathData);
        }
    }, [learningPathData]);

    useEffect(() => {
        if (isStudent && learningPath) {
            calculateProgress();
        }
    }, [learningPath]);

    const calculateProgress = () => {
        if (!learningPath) return 0;
        const totalNodes = learningPath.nodes.length;
        const completedNodes = learningPath.nodes.filter(node => node.done).length;

        setProgress((completedNodes / totalNodes) * 100);
    }

    // Handle click on learning object
    const handleClickLearningObject = async (learningObject: LearningObject) => {
        if (selectedLearningObject && isStudent) {
            await upsertLearningObjectProgress(selectedLearningObject!.id, true);
            learningPath!.nodes.find(obj => obj.localLearningObjectId === selectedLearningObject!.id)!.done = true;
            calculateProgress();
        }
        if (!learningObject) return;
        setSelectedLearningObject(learningObject);
    };

    console.log('progress', progress);

    return (
        <div className="flex min-h-[calc(100vh-80px)]">
            {/* Sidebar */}
            <div className="p-4 max-w-[416px] w-full bg-gray-50 max-h-[calc(100vh-80px)]">
                <div className="rounded-lg border border-gray-200 p-2.5 bg-white">
                    {isLoadingLearningObjects ? (
                        <p>Loading learning objects...</p>
                    ) : isErrorLearningObjects ? (
                        <p>Error: {errorLearningObjects.message}</p>
                    ) : (
                        <>
                            <div className="flex gap-2.5 -m-2.5 p-2.5 border-b border-gray-200">
                                <h2 className="text-xl font-bold">{learningPath?.title}</h2>
                                {isStudent && (
                                    <div className="flex items-center gap-2 ml-auto">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col overflow-y-auto">
                                {learningObjectsData?.map((learningObject) => (
                                    <button
                                        className={`p-4 text-base font-normal border-b border-gray-200 text-left bg-transparent transition-colors duration-200 hover:bg-gray-50 ${selectedLearningObject?.id === learningObject.id
                                            ? 'bg-blue-50 text-blue-600 font-medium border-l-[3px] border-l-blue-600'
                                            : ''
                                            }`}
                                        key={learningObject.id}
                                        onClick={() => handleClickLearningObject(learningObject)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{learningObject.title}</span>
                                            <svg
                                                className={`w-5 h-5 ${learningObject.done ? 'text-green-500' : 'text-gray-300'}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                {learningPathData?.nodes.find(node => node.localLearningObjectId === learningObject.id && node.done) ? (
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                        color='green'
                                                    />
                                                ) : (
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="8"
                                                        strokeWidth={2}
                                                        color='gray'
                                                    />
                                                )}
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="border-l border-gray-200 w-full p-6 pb-[74px] max-h-[calc(100vh-80px)] overflow-y-auto">
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
                <div className="fixed bottom-0 right-0 flex p-4 justify-end border-t border-gray-200 bg-white w-[calc(100%-416px)] z-10">
                    {isStudent && (
                        <button
                            className="px-4 py-2 text-base font-normal rounded bg-blue-600 text-white border-none cursor-pointer transition-opacity duration-200 disabled:opacity-50"
                            onClick={() => {
                                handleClickLearningObject(nextObject)
                                if (nextObject == null) {
                                    //TODO
                                }
                            }}
                            disabled={progress === 100}
                        >
                            {nextObject
                                ? `Up Next: ${nextObject.title}`
                                : 'Complete Learning Path'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
