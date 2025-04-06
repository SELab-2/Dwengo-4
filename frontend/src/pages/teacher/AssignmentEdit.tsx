import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAssignment,
  fetchClasses,
  fetchLearningPath,
  fetchStudentsByClass,
} from '../../util/teacher/httpTeacher';
import CreateClass from '../../components/teacher/classes/CreateClassForm';
import AddAssignmentForm from '../../components/teacher/assignment/AddAssignmentForm';
import { useParams } from 'react-router-dom';
import { AssignmentPayload, ClassItem, LearningPath } from '../../types/type';

/**
 * Assignment edit component that allows teachers to modify existing assignments.
 * It fetches the assignment details, available classes, and associated learning path.
 * @returns React component for editing assignments
 */
const AddAssignment: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  /**
   * Query hook to fetch the assignment data
   * Enabled only when assignmentId is available
   */
  const {
    data: assignmentData,
    isLoading,
    isError,
    error,
  } = useQuery<AssignmentPayload>({
    queryKey: ['assignment', assignmentId],
    queryFn: () => fetchAssignment(assignmentId!, true, true),
    enabled: !!assignmentId,
  });

  /**
   * Query hook to fetch all available classes
   */
  const {
    data: classesData,
    isLoading: isClassLoading,
    isError: isClassError,
    error: classError,
  } = useQuery<ClassItem[]>({
    queryKey: ['classes'],
    queryFn: () => fetchClasses(true),
  });

  return (
    <div>
      {isLoading && isClassLoading ? (
        'Assignment Loading...'
      ) : (
        <AddAssignmentForm
          classesData={classesData ?? []}
          isEditing={true}
          assignmentData={assignmentData}
        />
      )}
    </div>
  );
};

export default AddAssignment;
