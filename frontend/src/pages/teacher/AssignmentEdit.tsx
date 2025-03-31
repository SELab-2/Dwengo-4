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

const AddAssignment: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();

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

  const {
    data: classesData,
    isLoading: isClassLoading,
    isError: isClassError,
    error: classError,
  } = useQuery<ClassItem[]>({
    queryKey: ['classes'],
    queryFn: () => fetchClasses(true),
  });

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
    queryFn: () =>
      fetchLearningPath(assignmentData?.pathRef!, assignmentData?.isExternal!),
    enabled: !!assignmentData?.pathRef,
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
