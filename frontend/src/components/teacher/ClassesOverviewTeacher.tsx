import { useQuery } from '@tanstack/react-query';
import { fetchClasses } from '../../util/teacher/httpTeacher';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../shared/PrimaryButton';
import React from 'react';
import { ClassItem } from '../../types/type';

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

  const navigate = useNavigate();

  return (
    <>
      <div className="w-full flex flex-row gap-5 flex-wrap">
        {isLoading && <p>Laden ...</p>}
        {isError && (
          <p className="c-r">
            {error?.info?.message ||
              'Er is iets fout gegaan bij het ophalen van de klassen.'}
          </p>
        )}

        {!isLoading && !isError && classes && classes.length > 0 ? (
          <>
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center flex-row w-[20rem] p-4 justify-between bg-gray-100 rounded-lg shrink-0"
              >
                <div className="flex flex-col">
                  <div className="flex flex-row w-full justify-between mb-1">
                    <h3 className="text-2xl font-bold">{classItem.name}</h3>
                  </div>

                  <p>
                    <b>Code:</b> {classItem.code}
                  </p>

                  <div className="flex mt-4 flex-row justify-between items-center text-sm">
                    <PrimaryButton
                      onClick={() =>
                        navigate(`/teacher/classes/${classItem.id}`)
                      }
                    >
                      <span className="">Klas bekijken</span>
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          !isLoading && <p>Geen klassen gevonden.</p>
        )}
      </div>
    </>
  );
}
