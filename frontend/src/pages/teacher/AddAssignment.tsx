import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchClass,
  fetchStudentsByClass,
} from "../../util/teacher/httpTeacher";
import { SecondaryButton } from "../../components/shared/PrimaryButton";
import CreateClass from "../../components/teacher/classes/CreateClassForm";
import AddAssignmentForm from "../../components/teacher/assignment/AddAssignmentForm";
import { useParams } from "react-router-dom";

interface ClassItem {
  id: string;
  name: string;
  code: string;
}

const AddAssignment: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();

  const {
    data: classData,
    isLoading: isClassLoading,
    isError: isClassError,
    error: classError,
  } = useQuery<ClassItem>({
    queryKey: ["class", classId],
    queryFn: () => fetchClass({ classId: Number(classId) }),
  });

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    error: studentsError,
  } = useQuery({
    queryKey: ["students", classId],
    queryFn: async () => fetchStudentsByClass({ classId: Number(classId) }),
  });

  if (isClassLoading || isStudentsLoading) {
    return <div>Loading...</div>;
  }

  if (isClassError || isStudentsError) {
    return <div>Error: {classError?.message || studentsError?.message}</div>;
  }

  const studentsCorData = studentsData?.map((data: any) => ({
    id: data.user.id,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    email: data.user.email,
  }));

  const formData = {
    name: classData?.name || "",
    students: studentsCorData || [],
  };

  return (
    <div>
      <AddAssignmentForm formData={formData} />
    </div>
  );
};

export default AddAssignment;
