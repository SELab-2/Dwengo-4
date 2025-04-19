import '../../index.css';
import React from 'react';
import { Link } from 'react-router-dom';
import AssignmentOverviewTeacher from '../../components/teacher/AssignmentOverviewTeacher';
import ClassesOverviewTeacher from '../../components/teacher/ClassesOverviewTeacher';

export default function TeacherIndex() {
  return (
    <>
      <div className="px-10 bg-gray-300">
        <div className="text-6xl pt-12 font-bold">Home</div>

        <h2 className="mt-8 text-2xl font-bold">Opdrachten</h2>
        <div className="w-full mt-4 overflow-x-auto ">
          <AssignmentOverviewTeacher />
        </div>

        <div className="flex flex-row justify-end w-full ">
          <Link
            to="/assignment"
            className="font-bold hover:cursor-pointer hover:underline"
          >
            Bekijk alle opdrachten
            <i className="fa-solid ml-1.5 fa-arrow-right"></i>
          </Link>
        </div>

        <p className="text-2xl mt-8 font-bold">Klasgroepen</p>
        <div className="w-full mt-4">
          <ClassesOverviewTeacher />
        </div>
      </div>
    </>
  );
}
