import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { AssignmentPayload, LearningPath } from '../../types/type';
import { fetchAssignment } from '@/util/teacher/assignment';
import { fetchLearningPath } from '@/util/shared/learningPath';
import { useTranslation } from 'react-i18next';

const AssignmentStudent: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { t } = useTranslation();
  const studentId = localStorage.getItem('id');

  /**
   * Query hook to fetch assignment data
   */
  const {
    data: assignment,
    isLoading,
    isError,
    error,
  } = useQuery<AssignmentPayload>({
    queryKey: ['assignment', assignmentId],
    queryFn: () => fetchAssignment(assignmentId ?? '', false, true),
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
    queryKey: ['learningPath', assignment?.pathRef, assignment?.isExternal],
    queryFn: () => {
      // Only proceed if both values are defined
      if (assignment?.pathRef && assignment?.isExternal !== undefined) {
        return fetchLearningPath(assignment.pathRef, assignment.isExternal);
      }
      throw new Error('Missing learning path reference or external flag');
    },
    enabled: !!(assignment?.pathRef && assignment?.isExternal !== undefined),
  });

  const findTeam = () => {
    if (!assignment?.classTeams || !studentId) return null;

    // Look through each class's teams
    for (const classTeams of Object.values(assignment.classTeams)) {
      // Find the team that contains the student
      const team = classTeams.find((team) =>
        team.students.some((s) => s.id.toString() === studentId),
      );
      if (team) return team;
    }
    return null;
  };

  const studentTeam = assignment ? findTeam() : null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {t('assignments.view_assignment')}
      </h1>
      {isLoading && <p className="text-gray-600">Loading...</p>}
      {isError && <p className="text-red-500">Error: {error.message}</p>}
      {assignment && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{assignment.title}</h2>
            <Link to={`/student/questions/${assignment.id}/`}>
              <div className="bg-dwengo-green hover:opacity-80 px-3.5 py-2 rounded-xl text-xl">
                <p className="text-white">?</p>
              </div>
            </Link>
          </div>
          <p className="text-gray-700 mb-4">{assignment.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <p className="text-gray-600">
              {t('assignment.language')}: {assignment.pathLanguage}
            </p>
            <p className="text-gray-600">
              {t('assignment.deadline')}:{' '}
              {new Date(assignment.deadline).toLocaleDateString()}
            </p>
          </div>

          {/* Add team section before learning path */}
          {assignment && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-xl font-semibold mb-4">
                {t('assignment.team')}
              </h3>
              {studentTeam ? (
                <div className="bg-gray-50 rounded-md p-4">
                  <h4 className="text-lg font-medium mb-2">{studentTeam.id}</h4>
                  <div className="space-y-2">
                    {studentTeam.students.map((member) => (
                      <div
                        key={member.id}
                        className={`${member.id.toString() === studentId ? 'font-bold' : ''}`}
                      >
                        {member.firstName} {member.lastName}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">{t('assignments.no_team')}</p>
              )}
            </div>
          )}

          <h3 className="text-xl font-semibold mb-4">
            {t('assignment.learning_path_details')}
          </h3>
          {isLearningPathLoading && (
            <p className="text-gray-600">
              {' '}
              {t('assignment.loading_learning_path')}
            </p>
          )}
          {isLearningPathError && (
            <p className="text-red-500">Error: {learningPathError.message}</p>
          )}
          {learningPathData && (
            <div className="bg-gray-50 rounded-md p-4">
              <a
                href={`/student/learning-paths/${assignment.pathRef}`}
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
