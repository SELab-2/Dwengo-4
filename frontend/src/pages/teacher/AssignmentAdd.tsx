import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AddAssignmentForm from '../../components/teacher/assignment/AddAssignmentForm';
import { useParams } from 'react-router-dom';
import { ClassItem } from '../../types/type';
import { fetchClasses } from '@/util/teacher/class';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const {
    data: classesData,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem[]>({
    queryKey: ['classes'],
    queryFn: () => fetchClasses(true),
  });

  console.log('Classes Data:', classesData);
  return (
    <div>
      {isLoading ? (
        <div>{t('loading.loading')}</div>
      ) : isError ? (
        <div>Error: {error?.message}</div>
      ) : (
        <AddAssignmentForm classesData={classesData ?? []} classId={classId} />
      )}
    </div>
  );
};

export default AddAssignment;
