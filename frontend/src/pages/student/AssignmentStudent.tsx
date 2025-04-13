import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchAssignment } from '../../util/student/httpStudent';
import { AssignmentPayload } from '../../types/type';

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
    data: assignment,
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
//    */
  //   const {
  //     data: learningPathData,
  //     isLoading: isLearningPathLoading,
  //     isError: isLearningPathError,
  //     error: learningPathError,
  //   } = useQuery<LearningPath>({
  //     queryKey: ['learningPath', assignment?.pathRef, assignment?.isExternal],
  //     queryFn: () => {
  //       // Only proceed if both values are defined
  //       if (assignment?.pathRef && assignment?.isExternal !== undefined) {
  //         return fetchLearningPath(assignment.pathRef, assignment.isExternal);
  //       }
  //       throw new Error('Missing learning path reference or external flag');
  //     },
  //     enabled: !!(assignment?.pathRef && assignment?.isExternal !== undefined),
  //   });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Assignment</h1>
      {isLoading && <p className="text-gray-600">Loading...</p>}
      {isError && <p className="text-red-500">Error: {error.message}</p>}
      {assignment && (
        <div>
          <div>
            <div className="p-5">
              <div className="flex flex-row justify-between w-full">
                <h2 className="text-2xl font-semibold mb-2 ">
                  {assignment.title}
                </h2>
                <div>
                  <Link to={`/student/question/new/${assignment.id}`}>
                    <div className="bg-dwengo-green hover:opacity-80 px-3.5 hover:cursor-pointer py-2 rounded-xl text-xl w-min">
                      <p className="bg-dwengo-green">?</p>
                    </div>
                  </Link>
                </div>
              </div>
              <p className="text-gray-600 mb-2 line-clamp-3">
                {assignment.description}
              </p>
            </div>
          </div>
          <p>
            TODO de rest van deze pagina, obviously. Dees is gewoon een dummy
            voor celeste die questions implementeert for now.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentStudent;
