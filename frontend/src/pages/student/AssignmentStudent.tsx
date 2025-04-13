import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchAssignment } from '../../util/student/httpStudent';
import { AssignmentPayload, LearningPath } from '../../types/type';
import { fetchLearningPath } from '../../util/student/httpStudent';

/**
 * AssignmentStudent component for students to view assignment details.
 * Displays assignment title, description, deadline, and associated learning path.
 *
 * Features:
 * - Shows assignment details
 * - Displays associated learning path information
 * - Handles loading and error states
 *
 * @component
 * @returns {JSX.Element} The rendered AssignmentStudent component
 */
const AssignmentStudent: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  /**
   * Query hook to fetch assignment data
   */
  const {
    data: assignmentData,
    isLoading,
    isError,
    error,
  } = useQuery<AssignmentPayload>({
    queryKey: ['assignment', assignmentId],
    queryFn: () => fetchAssignment(assignmentId ?? ''),
    enabled: !!assignmentId,
  });

  /**
   * Query hook to fetch associated learning path data
   */
  const {
    data: learningPathData,
    isLoading: isLearningPathLoading,
    isError: isLearningPathError,
    error: learningPathError,
  } = useQuery<LearningPath>({
    queryKey: [
      'learningPath',
      assignmentData?.pathRef,
      assignmentData?.isExternal,
    ],
    queryFn: () => {
      // Only proceed if both values are defined
      if (assignmentData?.pathRef && assignmentData?.isExternal !== undefined) {
        return fetchLearningPath(
          assignmentData.pathRef,
          assignmentData.isExternal,
        );
      }
      throw new Error('Missing learning path reference or external flag');
    },
    enabled: !!(
      assignmentData?.pathRef && assignmentData?.isExternal !== undefined
    ),
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Assignment</h1>
      {isLoading && <p className="text-gray-600">Loading...</p>}
      {isError && <p className="text-red-500">Error: {error.message}</p>}
      {assignmentData && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            {assignmentData.title}
          </h2>
          <p className="text-gray-700 mb-4">{assignmentData.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <p className="text-gray-600">
              Language: {assignmentData.pathLanguage}
            </p>
            <p className="text-gray-600">
              Deadline: {new Date(assignmentData.deadline).toLocaleDateString()}
            </p>
          </div>
          <h3 className="text-xl font-semibold mb-4">Learning Path</h3>
          {isLearningPathLoading && (
            <p className="text-gray-600">Loading learning path...</p>
          )}
          {isLearningPathError && (
            <p className="text-red-500">Error: {learningPathError.message}</p>
          )}
          {learningPathData && (
            <div className="bg-gray-50 rounded-md p-4">
              <a
                href={`/learning-path/${assignmentData.pathRef}`}
                className="text-blue-600 hover:text-blue-800"
              >
                <h4 className="text-lg font-medium mb-2">
                  {learningPathData.title}
                </h4>
              </a>
              <p className="text-gray-700">{learningPathData.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentStudent;
