import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AssignmentItem,
  fetchAssignments,
} from '../../util/student/httpStudent';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../shared/PrimaryButton';

export default function AssignmentOverview() {
  // Query: Haal alle klassen op
  const {
    data: assignments,
    isLoading,
    isError,
    error,
  } = useQuery<AssignmentItem[]>({
    queryKey: ['assignments'],
    queryFn: fetchAssignments,
  });

  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-row gap-x-5 h-[12.5rem]  ">
        {isLoading && <p>Laden ...</p>}
        {isError && (
          <p className="c-r">
            {error?.info?.message ||
              'Er is iets fout gegaan bij het ophalen van de taken.'}
          </p>
        )}

        {!isLoading && !isError && assignments && assignments.length > 0 ? (
          <>
            {assignments.map((assignmentItem) => {
              const date = new Date(assignmentItem.deadline);
              const formattedDate = date.toLocaleDateString('nl-BE');
              console.log(formattedDate);

              return (
                <>
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
                          Deadline: {formattedDate}
                        </p>
                      </div>
                      <div className="h-20 mt-1 text-gray-500 line-clamp-3">
                        {assignmentItem.description}
                      </div>
                      <div className="flex mt-1 flex-row justify-between items-center text-sm">
                        <PrimaryButton
                          onClick={() =>
                            navigate(`/student/assignment/${assignmentItem.id}`)
                          }
                        >
                          Leerpad bekijken
                        </PrimaryButton>
                        {/*<p>12/50 completed</p> Replace with actual progress*/}
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </>
        ) : (
          !isLoading && <p>Geen opdrachten gevonden.</p>
        )}
      </div>
    </>
  );
}
