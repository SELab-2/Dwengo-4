import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { AssignmentPayload, LearningPath } from '../../types/type';
import { deleteAssignment, fetchAssignment } from '@/util/teacher/assignment';
import { fetchLearningPath } from '@/util/shared/learningPath';
import { useTranslation } from 'react-i18next';
import { Assignment } from '@prisma/client';

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
  const navigate = useNavigate();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [displayedClass, setDisplayedClass] = useState<any>(null);

  /**
   * Query hook to fetch assignment data
   */
  const {
    data: assignmentData,
    isLoading,
    isError,
    error,
  } = useQuery<Assignment>({
    queryKey: ['classes', assignmentId],
    queryFn: () => fetchAssignment(assignmentId!, true, true),
    enabled: !!assignmentId,
  });

  useEffect(() => {
    if (assignmentData?.classAssignments?.[0]) {
      setSelectedClassId(assignmentData.classAssignments[0].classId);
    }
  }, [assignmentData]);

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
      navigate('/teacher/classes');
    },
  });

  /**
   * Handles the deletion of an assignment with confirmation
   */
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignmentMutation.mutate(assignmentId!);
      navigate('/teacher');
    }
  };


  console.log('Displayed Class:', assignmentData?.classAssignments);
  useEffect(() => {
    setDisplayedClass(assignmentData?.classAssignments?.find(
      ca => ca.classId === Number(selectedClassId)
    ));
  }, [selectedClassId]);

  console.log(assignmentData)
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('assignment.title')}</h1>
      {isLoading && <p className="text-gray-600">{t('loading.loading')}</p>}
      {isError && <p className="text-red-500">Error: {error.message}</p>}
      {assignmentData && (
        <div >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{assignmentData.title}</h2>
            <div className="space-x-2">
              <a
                href={`/teacher/assignment/${assignmentId}/edit`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                {t('assignment.edit')}
              </a>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                {t('assignment.delete')}
              </button>
            </div>
          </div>
          <p className="text-gray-700 mb-4">{assignmentData.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <p className="text-gray-600">
              {t('assignment.language')}: {assignmentData.pathLanguage}
            </p>
            <p className="text-gray-600">
              {t('assignment.deadline')}:{' '}
              {new Date(assignmentData.deadline).toLocaleDateString()}
            </p>
          </div>

          {/* Classes Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Assigned Classes</h3>
            <div className="min-h-[400px] max-h-[400px] overflow-y-auto pr-2 bg-gray-50">
              <div className="sticky top-0 bg-gray-50 p-2 border-b z-10">
                <select
                  className="w-full p-2 border rounded-md bg-white shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={selectedClassId || ''}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  {assignmentData?.classAssignments?.map((ca) => (
                    <option key={ca.classId} value={ca.classId}>
                      {ca.class.name}
                    </option>
                  ))}
                </select>
              </div>

              {displayedClass && (
                <div className="p-4">
                  {assignmentData.teamSize > 1 ? (
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        {t('assignment.team')}
                      </h5>
                      <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {assignmentData.classTeams?.[displayedClass.classId]?.map((team) => {
                          const teamAssignment = assignmentData.teamAssignments?.find(
                            ta => ta.teamId === team.id
                          );
                          return (
                            <div key={team.id}
                              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="font-semibold text-blue-600 mb-2 pb-2 border-b">
                                {teamAssignment?.team?.teamname || team.teamName}
                              </div>
                              <div className="space-y-1">
                                {team.students.map((student, idx) => (
                                  <div key={student.id}
                                    className="flex items-center text-sm text-gray-600 hover:bg-gray-50 p-1 rounded">
                                    <span className="w-6 text-gray-400">{idx + 1}.</span>
                                    {student.firstName} {student.lastName}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Students in {displayedClass.class.name}
                      </h5>
                      <div className="grid grid-cols-3 gap-4">
                        {assignmentData.classTeams?.[displayedClass.classId]?.map((team, idx) => (
                          <div key={team.id}
                            className="flex items-center p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <span className="w-6 text-gray-400">{idx + 1}.</span>
                            <span className="text-gray-700">
                              {team.students[0].firstName} {team.students[0].lastName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Learning Path Section */}
          <h3 className="text-xl font-semibold mb-4">
            {t('assignment.learning_path_details')}
          </h3>
          {isLearningPathLoading && (
            <p className="text-gray-600">
              {t('assignment.loading_learning_path')}
            </p>
          )}
          {isLearningPathError && (
            <p className="text-red-500">Error: {learningPathError.message}</p>
          )}
          {learningPathData && (
            <div className="bg-gray-50 rounded-md p-4">
              <a
                href={`/teacher/learning-path/${assignmentData.pathRef}`}

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
