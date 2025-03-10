import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClasses } from "../../util/teacher/httpTeacher";
import { SecondaryButton } from "../../components/shared/PrimaryButton";
import CreateClass from "../../components/teacher/classes/CreateClassForm";
import { useParams } from "react-router-dom";
interface ClassItem {
  id: string;
  name: string;
  code: string;
}

const ClassPage: React.FC = () => {
  const {
    data: classes,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem[]>({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  const { classId } = useParams<{ classId: string }>();

  const handleClick = () => {};

  return (
    <div className="g-30">
      <SecondaryButton href={`/teacher/dashboard/${classId}/add-assignment`}>
        Maak Opdracht
      </SecondaryButton>
    </div>
  );
};

export default ClassPage;
