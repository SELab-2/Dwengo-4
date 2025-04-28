import PrimaryButton from '../shared/PrimaryButton';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClassItem } from '@/types/type';
import { fetchClasses } from '@/util/student/class';

export default function ClassesStudent() {
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

  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <>
      <div className="w-full flex flex-row gap-5 flex-wrap">
        {isLoading && <p>{t('loading.loading')}</p>}
        {isError && (
          <p className="c-r">{error?.info?.message || t('classes.error')}</p>
        )}

        {!isLoading && !isError && classes && classes.length > 0 ? (
          <>
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center flex-row w-[20rem] p-4 justify-between bg-gray-100 rounded-lg shrink-0"
              >
                <div className="flex flex-col">
                  <div className="flex flex-row w-full justify-between">
                    <h3 className="text-2xl font-bold">{classItem.name}</h3>
                  </div>

                  <div className="flex mt-4 flex-row justify-between items-center text-sm">
                    <PrimaryButton
                      onClick={() => navigate(`/student/class/${classItem.id}`)}
                    >
                      <span className="">{t('classes.view')}</span>
                    </PrimaryButton>
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
