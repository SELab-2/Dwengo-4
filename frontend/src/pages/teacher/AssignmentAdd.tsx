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
      <AddAssignmentForm classesData={classesData ?? []} classId={classId} />
    </div>
  );
};

export default AddAssignment;
