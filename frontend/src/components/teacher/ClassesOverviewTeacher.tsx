import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PrimaryButton from '../shared/PrimaryButton';
import React from 'react';
import { ClassItem } from '@/types/type';
import { useTranslation } from 'react-i18next';
import { fetchClasses } from '@/util/teacher/class';

export default function ClassesOverviewTeacher() {
  // Query: Haal alle klassen op
  const {
    data: classes,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem[]>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });
  const { t } = useTranslation();

  return (
    <>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading && <p>{t('loading.loading')}</p>}
        {isError && (
          <p className="c-r">{error?.info?.message || t('classes.error')}</p>
        )}

        {!isLoading && !isError && classes && classes.length > 0 ? (
          <>
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="flex flex-col p-4 justify-between bg-white shadow-md rounded-lg mb-4 max-w-[20rem] w-full"
              >
                <div className="flex flex-col bg-white">
                  <div className="flex flex-row w-full bg-white justify-between mb-1">
                    <h3 className="text-2xl font-bold">{classItem.name}</h3>
                  </div>

                  <p>
                    <b>{t('code')}:</b> {classItem.code}
                  </p>

                  <div className="flex bg-white mt-4 flex-row justify-between items-center text-sm">
                    <Link to={`/teacher/classes/${classItem.id}`}>
                      <PrimaryButton>
                        <span className="">{t('classes.view')}</span>
                      </PrimaryButton>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          !isLoading && <p>{t('classes.not_found')}</p>
        )}
      </div>
    </>
  );
}
