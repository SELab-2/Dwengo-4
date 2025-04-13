import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AssignmentItem,
  fetchAssignments,
} from '../../util/student/httpStudent';
import { Link } from 'react-router-dom';
import PrimaryButton from '../../components/shared/PrimaryButton';

/**
 * AssignmentsStudent component for students to view all their assignments.
 * Displays a list of assignments with details like title, description, and deadline.
 *
 * Features:
 * - Shows all assignments for the logged-in student
 * - Provides links to individual assignment details
 * - Shows deadline information with visual indicators
 * - Handles loading and error states
 *
 * @component
 * @returns {JSX.Element} The rendered AssignmentsStudent component
 */
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

  /**
   * Determine if an assignment is past due
   * @param {string} deadlineDate - The deadline date string
   * @returns {boolean} Whether the deadline has passed
   */
  const isPastDue = (deadlineDate: string): boolean => {
    const deadline = new Date(deadlineDate);
    const today = new Date();
    return today > deadline;
  };

  /**
   * Determine if an assignment is due soon (within 3 days)
   * @param {string} deadlineDate - The deadline date string
   * @returns {boolean} Whether the deadline is approaching soon
   */
  const isDueSoon = (deadlineDate: string): boolean => {
    const deadline = new Date(deadlineDate);
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    return today <= deadline && deadline <= threeDaysFromNow;
  };

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
          {assignments.map((assignment) => {
            const pastDue = isPastDue(assignment.deadline);
            const dueSoon = isDueSoon(assignment.deadline);

            return (
              <div
                key={assignment.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 
                  ${pastDue ? 'border-l-4 border-red-500' : dueSoon ? 'border-l-4 border-yellow-500' : ''}`}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignmentsStudent;
