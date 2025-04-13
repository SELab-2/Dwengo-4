import React from 'react';
import { useParams } from 'react-router-dom';
import AssignmentsForClassOverview from '../../components/student/AssignmentClassOverview';
import { useQuery } from '@tanstack/react-query';
import { fetchClass } from '../../util/student/httpStudent';
import { ClassItem } from '../../types/type';

const StudentClassIndex: React.FC = () => {
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

  return (
    <>
      <div className="px-10">
        <div className="text-6xl pt-12 font-bold">
          {isLoading && <p>Laden ...</p>}
          {isError && (
            <p className="c-r">
              {error?.info?.message ||
                'Er is iets fout gegaan bij het ophalen van de taken.'}
            </p>
          )}
          {!isLoading && !isError && classItem && classItem.name}
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
