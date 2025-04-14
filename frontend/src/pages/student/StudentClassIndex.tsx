import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssignmentsForClassOverview from '../../components/student/AssignmentClassOverview';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClass, fetchLeaveClass } from '../../util/student/httpStudent';
import { ClassItem } from '../../types/type';

const StudentClassIndex: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { classId } = useParams<{ classId: string }>();

  const {
    data: classItem,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem>({
    queryKey: ['classItem', classId],
    queryFn: () => fetchClass({ classId: classId }),
  });

  const handleLeaveClass = async () => {
    if (
      window.confirm(
        'Weet je zeker dat je deze klas wilt verlaten? Om opnieuw lid te worden heb je een uitnodigingscode nodig.',
      )
    ) {
      try {
        const response = await fetchLeaveClass({ classId: classId });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              'Er is iets misgegaan bij het verlaten van de klas.',
          );
        }

        queryClient.invalidateQueries({ queryKey: ['classes'] });
        navigate('/student');
      } catch (error) {
        console.error('Fout bij het verwijderen van de klas:', error);
      }
    }
  };

  return (
    <>
      <div className="px-10">
        <div className="flex flex-row justify-between items-end pr-10">
          <div className="text-6xl pt-12 font-bold">
            {isLoading && <p>Laden ...</p>}
            {isError && (
              <p className="c-r">
                {error?.info?.message ||
                  'Er is iets fout gegaan bij het ophalen van de klas.'}
              </p>
            )}
            {!isLoading && !isError && classItem && classItem.name}
          </div>
          <button
            onClick={handleLeaveClass}
            className="font-bold hover:cursor-pointer hover:underline"
          >
            Klas verlaten
          </button>
        </div>
        <h2 className="mt-8 text-2xl font-bold">Opdrachten</h2>
        <div className="w-full mt-4 ">
          <AssignmentsForClassOverview classId={classId} />
        </div>
      </div>
    </>
  );
};

export default StudentClassIndex;
