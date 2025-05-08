import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PrimaryButton from '../../components/shared/PrimaryButton';
import { AssignmentItem } from '@/types/api.types';
import { fetchAssignments } from '@/util/student/assignment';

const AssignmentsStudent: React.FC = () => {
  /**
   * Query hook to fetch all assignments for the student
   */
  const {
    data: assignments,
    isLoading,
    isError,
    error,
  } = useQuery<AssignmentItem[]>({
    queryKey: ['assignments'],
    queryFn: fetchAssignments,
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Assignments</h1>

      {isLoading && <p className="text-gray-600">Loading assignments...</p>}

      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error.message}</p>
        </div>
      )}

      {assignments && assignments.length === 0 && (
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-blue-800">You don't have any assignments yet.</p>
        </div>
      )}

      {assignments && assignments.length > 0 && (
        <div className="flex flex-col bg-white p-10">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300`}
            >
              <div className="p-5">
                <div className="flex flex-row justify-between w-full">
                  <h2 className="text-2xl font-semibold mb-2 ">
                    {assignment.title}
                  </h2>
                  <div className="text-sm text-red-500">
                    Deadline:{' '}
                    {new Date(assignment.deadline).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-600 mb-2 line-clamp-3">
                  {assignment.description}
                </p>
              </div>
              <div className="bg-gray-50 pl-3 pb-3">
                <Link
                  to={`/student/assignment/${assignment.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <PrimaryButton>View Learning Path</PrimaryButton>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsStudent;
