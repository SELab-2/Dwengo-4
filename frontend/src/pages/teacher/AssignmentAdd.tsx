import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchClasses,
  fetchStudentsByClass,
} from '../../util/teacher/httpTeacher';
import CreateClass from '../../components/teacher/classes/CreateClassForm';
import AddAssignmentForm from '../../components/teacher/assignment/AddAssignmentForm';
import { useParams } from 'react-router-dom';
import { ClassItem } from '../../types/type';

/**
 * AddAssignment Component
 * 
 * A React component that handles the creation of new assignments for a class.
 * It fetches the available classes and renders a form to create an assignment.
 * 
 * @component
 * @example
 * ```tsx
 * <AddAssignment />
 * ```
 * 
 * URL Parameters:
 * - classId?: string - Optional class ID from the URL params to pre-select a class
 * 
 * Features:
 * - Fetches available classes using react-query
 * - Displays loading state while fetching data
 * - Handles error states
 * - Renders AddAssignmentForm with fetched class data
 */
const AddAssignment: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();

  const {
    data: classesData,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem[]>({
    queryKey: ['classes'],
    queryFn: () => fetchClasses(true),
  });

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {error?.message}</div>
      ) : (
        <AddAssignmentForm classesData={classesData ?? []} classId={classId} />
      )}
    </div>
  );
};

export default AddAssignment;
