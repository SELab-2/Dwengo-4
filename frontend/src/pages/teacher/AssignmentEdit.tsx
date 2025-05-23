import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AddAssignmentForm from '../../components/teacher/assignment/AddAssignmentForm';
import { useParams } from 'react-router-dom';
import { AssignmentPayload, ClassItem } from '../../types/type';
import { fetchAssignment } from '@/util/teacher/assignment';
import { fetchClasses } from '@/util/teacher/class';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div>
      {isLoading && isClassLoading ? (
        t('loading.loading')
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
