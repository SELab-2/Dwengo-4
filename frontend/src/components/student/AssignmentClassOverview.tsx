import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PrimaryButton from '../shared/PrimaryButton';
import { useTranslation } from 'react-i18next';
import { AssignmentItem } from '@/util/student/classJoin';
import { fetchAssignmentsForClass } from '@/util/student/assignment';

export default function AssignmentsForClassOverview({
  classId,
}: {
  classId: string;
}) {
  const { t } = useTranslation();
  // Query: Haal alle klassen op voor class
  const {
    data: assignments,
    isLoading,
    isError,
    error,
  } = useQuery<AssignmentItem[]>({
    queryKey: ['assignments', classId],
    queryFn: () => fetchAssignmentsForClass({ classId: classId }),
  });

  return (
    <>
      <div className="flex flex-row flex-wrap gap-5 h-[12.5rem]  ">
        {isLoading && <p>{t('loading.loading')}</p>}
        {isError && (
          <p className="c-r">
            {error?.info?.message || t('assignments.error')}
          </p>
        )}

        {!isLoading && !isError && assignments && assignments.length > 0 ? (
          <>
            {assignments.map((assignmentItem) => {
              const date = new Date(assignmentItem.deadline);
              const formattedDate = date.toLocaleDateString('nl-BE');

              return (
                <div
                  key={assignmentItem.id}
                  className="flex items-center flex-row py-2 px-3.5 w-[30rem] h-[11.5rem] justify-between bg-gray-100 rounded-lg shrink-0"
                >
                  <div className="flex flex-col w-full">
                    <div className="flex flex-row w-full justify-between">
                      <h3 className="text-2xl font-bold">
                        {assignmentItem.title}
                      </h3>
                      <p className="text-sm text-gray-700 translate-y-1.5">
                        {t('deadline', { date: formattedDate })}
                      </p>
                    </div>
                    <div className="h-20 mt-1 text-gray-500 line-clamp-3">
                      {assignmentItem.description}
                    </div>
                    <div className="flex mt-1 flex-row justify-between items-center text-sm">
                      <Link to={`/student/assignment/${assignmentItem.id}`}>
                        <PrimaryButton>{t('assignments.view')}</PrimaryButton>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          !isLoading && <p>{t('assignments.not_found')}</p>
        )}
      </div>
    </>
  );
}
