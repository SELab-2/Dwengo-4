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
        <div className={styles.main}>
            {/* Sidebar */}
            <div className={styles.sidebarWrapper}>


                <div className={styles.sidebar}>
                    {isLoadingLearningObjects ? (
                        <p>Loading learning objects...</p>
                    ) : isErrorLearningObjects ? (
                        <p>Error: {errorLearningObjects.message}</p>
                    ) : (
                        <><div className={styles.title}>
                            <h2 className={styles.titleH2}>{learningPath?.title}</h2>
                        </div><div className={styles.buttons}>
                                {learningObjectsData?.map((learningObject) => (
                                    <button
                                        className={`${styles.button} ${selectedLearningObject?.id === learningObject.id ? styles.active : ''
                                            }`}
                                        key={learningObject.id}
                                        onClick={() => setSelectedLearningObject(learningObject)}
                                    >
                                        {learningObject.title}
                                    </button>
                                ))}
                            </div></>
                    )}
                </div>
            </div>


            {/* Main content */}
            <div className={styles.rightSide} >
                <div className={styles.header}>

                    {!selectedLearningObject ? (
                        <>
                            <h3 className={styles.headerContent}>{learningPath?.title}</h3>
                            <p className={styles.headerDescription}>{learningPath?.description}</p>
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
                <div className={styles.footer}>
                    <button
                        className={styles.footerButton}
                        onClick={handleNextClick}
                        disabled={!getNextLearningObject()}
                    >
                        {getNextLearningObject()
                            ? `Up Next: ${getNextLearningObject()?.title}`
                            : 'End of Path'}
                    </button>
                </div>




            </div>


        </div >
    );
};

export default LearningPath;
