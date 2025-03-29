import '../../index.css';
import React from 'react';
import ClassesStudent from '../../components/student/ClassesStudent';
import AssignmentOverview from '../../components/student/AssignmentOverview';
import { Link } from 'react-router-dom';

export default function StudentIndex() {
  return (
    <>
      <div className="px-10 bg-gray-300">
        <div className="text-6xl pt-12 font-bold">Home</div>

        <h2 className="mt-8 text-2xl font-bold">Assignments</h2>
        <div className="w-full mt-4 overflow-x-auto ">
          <div className="flex flex-row gap-x-5 h-[12.5rem]  ">
            <AssignmentOverview />
          </div>
        </div>

        <div className="flex flex-row justify-end w-full ">
          <Link
            to="/assignment"
            className="font-bold hover:cursor-pointer hover:underline"
          >
            Bekijk alle taken
            <i className="fa-solid ml-1.5 fa-arrow-right"></i>
          </Link>
        </div>

        <p className="text-2xl mt-8 font-bold">Klasgroepen</p>
        <ClassesStudent />
        <div className="flex flex-row justify-end w-full ">
          <Link
            to="/class"
            className="font-bold hover:cursor-pointer hover:underline"
          >
            Bekijk alle klassen
            <i className="fa-solid ml-1.5 fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </>
  );
}
