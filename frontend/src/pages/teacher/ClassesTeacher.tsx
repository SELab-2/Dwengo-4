import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClasses } from "../../util/teacher/httpTeacher";
import PrimaryButton from "../../components/shared/PrimaryButton";
import CreateClass from "../../components/teacher/classes/CreateClassForm";
import { useNavigate } from "react-router-dom";

interface ClassItem {
  id: string;
  name: string;
  code: string;
}

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery<{
    classes: ClassItem[];
  }>({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  const classes = data?.classes || [];

  const handleTeacherInvite = (classId: string): void => {
    console.log(`Beheer leerkracht uitnodigingen voor klas: ${classId}`);
  };

  const handleStudentInvite = (classId: string): void => {
    console.log(`Beheer leerling uitnodigingen voor klas: ${classId}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <CreateClass />

      {isLoading && <p>Loading...</p>}
      {isError && (
        <p className="c-r">
          {(error as any)?.info?.message ||
            "Er is iets fout gegaan bij het ophalen van de klassen."}
        </p>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-4">
          <h2>Mijn Klassen</h2>
          <table>
            <thead>
              <tr>
                <th>Edit</th>
                <th>Naam</th>
                <th>Code</th>
                <th>Leerkracht Invite</th>
                <th>Leerling Invite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="c-r">
                    Geen klassen gevonden.
                  </td>
                </tr>
              ) : (
                classes.map((classItem: ClassItem) => (
                  <tr key={classItem.id} className="py-2">
                    <td className="py-3">
                      <PrimaryButton
                        onClick={() =>
                          navigate(`/teacher/classes/${classItem.id}`)
                        }
                      >
                        Beheer
                      </PrimaryButton>
                    </td>
                    <td className="py-3">{classItem.name}</td>
                    <td className="py-3">{classItem.code}</td>
                    <td className="py-3">
                      <PrimaryButton
                        onClick={() => handleTeacherInvite(classItem.id)}
                      >
                        Beheer
                      </PrimaryButton>
                    </td>
                    <td className="py-3">
                      <PrimaryButton
                        onClick={() => handleStudentInvite(classItem.id)}
                      >
                        Beheer
                      </PrimaryButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
