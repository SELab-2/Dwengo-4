import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { LearningPath } from '../../types/type';
import { AssignmentPayload } from '../../types/type';
import { deleteAssignment, fetchAssignment } from '@/util/teacher/assignment';
import { fetchLearningPath } from '@/util/teacher/learningPath';

/**
 * Assignment component for teachers to view and manage individual assignments.
 * Displays assignment details, associated learning path information, and provides
 * options to edit or delete the assignment.
 *
 * Features:
 * - Displays assignment title, description, language, and deadline
 * - Shows associated learning path details
 * - Provides edit and delete functionality
 * - Handles loading and error states
 *
 * @component
 * @returns {JSX.Element} The rendered Assignment component
 */
const Assignment: React.FC = () => {
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
    queryKey: ['classes', assignmentId],
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

  /**
   * Mutation hook for deleting an assignment
   */
  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: string) => deleteAssignment(Number(id)),
    onSuccess: () => {
      window.location.href = '/teacher/classes';
    },
  });

  /**
   * Handles the deletion of an assignment with confirmation
   */
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignmentMutation.mutate(assignmentId ?? '');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Assignment</h1>
      {isLoading && <p className="text-gray-600">Loading...</p>}
      {isError && <p className="text-red-500">Error: {error.message}</p>}
      {assignmentData && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{assignmentData.title}</h2>
            <div className="space-x-2">
              <a
                href={`/teacher/assignment/${assignmentId}/edit`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Edit
              </a>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-gray-700 mb-4">{assignmentData.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <p className="text-gray-600">
              Language: {assignmentData.pathLanguage}
            </p>
            <p className="text-gray-600">
              Deadline: {new Date(assignmentData.deadline).toLocaleDateString()}
            </p>
          </div>
          <h3 className="text-xl font-semibold mb-4">Learning Path Details</h3>
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

export default Assignment;
