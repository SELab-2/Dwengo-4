import '../../index.css';
import React from 'react';
import { Link } from 'react-router-dom';
import AssignmentOverviewTeacher from '../../components/teacher/AssignmentOverviewTeacher';
import ClassesOverviewTeacher from '../../components/teacher/ClassesOverviewTeacher';
import { useTranslation } from 'react-i18next';

export default function TeacherIndex() {
  const { t } = useTranslation();
  return (
    <>
      <div className="px-10 bg-gray-300 rounded-xl">
        <div className="text-6xl pt-12 font-bold">{t('home')}</div>

        <h2 className="mt-8 text-2xl font-bold">{t('assignments.label')}</h2>
        <div className="w-full mt-4 overflow-x-auto ">
          <AssignmentOverviewTeacher />
        </div>

        <div className="flex flex-row justify-end w-full ">
          <Link
            to="/teacher/assignments"
            className="font-bold hover:cursor-pointer hover:underline"
          >
            {t('assignments.view_all')}
            <i className="fa-solid ml-1.5 fa-arrow-right"></i>
          </Link>
        </div>

        <p className="text-2xl mt-8 font-bold">{t('classes.label')}</p>
        <div className="w-full mt-4">
          <ClassesOverviewTeacher />
        </div>
      </div>
    </>
  );
}
