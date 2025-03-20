import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClasses } from "../../util/teacher/httpTeacher";
import PrimaryButton from "../../components/shared/PrimaryButton";
import CreateClass from "../../components/teacher/classes/CreateClassForm";

interface ClassItem {
  id: string;
  name: string;
  code: string;
}

const ClassesPage: React.FC = () => {
  const { data: classes, isLoading, isError, error } = useQuery<ClassItem[]>({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  const handleTeacherInvite = (classId: string): void => {
    console.log(`Beheer leerkracht uitnodigingen voor klas: ${classId}`);
  };

  const handleStudentInvite = (classId: string): void => {
    console.log(`Beheer leerling uitnodigingen voor klas: ${classId}`);
  };

  return (
    <div className="g-30">
      <CreateClass />

      {isLoading && <p>Loading...</p>}
      {isError && (
        <p className="c-r">
          {(error as any)?.info?.message ||
            "Er is iets fout gegaan bij het ophalen van de klassen."}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <h2>Mijn Klassen</h2>
          <table>
            <thead>
              <tr>
                <th>Naam</th>
                <th>Code</th>
                <th>Leerkracht Invite</th>
                <th>Leerling Invite</th>
              </tr>
            </thead>
            <tbody>
              {classes?.map((classItem) => (
                <tr key={classItem.id}>
                  <td>{classItem.name}</td>
                  <td>{classItem.code}</td>
                  <td>
                    <PrimaryButton onClick={() => handleTeacherInvite(classItem.id)}>
                      Beheer
                    </PrimaryButton>
                  </td>
                  <td>
                    <PrimaryButton onClick={() => handleStudentInvite(classItem.id)}>
                      Beheer
                    </PrimaryButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ClassesPage;
