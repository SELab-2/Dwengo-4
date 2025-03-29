import PrimaryButton from '../shared/PrimaryButton';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClassItem, fetchClasses } from '../../util/student/httpStudent';
import { useNavigate } from 'react-router-dom';

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

  return (
    <>
      <div className="w-full flex flex-row justify-center">
        <div className="bg-white rounded-xl m-12 flex flex-row w-full xl:w-[90rem] justify-center">
          <div className="flex-row flex items-center m-12 gap-7 w-full flex-wrap justify-center">
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
                    className="flex items-center flex-row py-2 px-3.5 w-[20rem] h-[11.5rem] justify-between bg-gray-100 rounded-lg shrink-0"
                  >
                    <div className="flex flex-col">
                      <div className="flex flex-row w-full justify-between">
                        <h3 className="text-2xl font-bold">{classItem.name}</h3>
                      </div>

                      <div className="flex mt-1 flex-row justify-between items-center text-sm">
                        <PrimaryButton
                          onClick={() =>
                            navigate(`/student/class/${classItem.id}`)
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
        </div>
      </div>
    </>
  );
}
