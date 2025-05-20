import '../../index.css';
import React from 'react';
import ClassesStudent from '../../components/student/ClassesStudent';
import AssignmentOverview from '../../components/student/AssignmentOverview';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function StudentIndex() {
  const { t } = useTranslation();

  return (
    <>
      <div className="px-10">
        <div className="text-6xl pt-12 font-bold">{t('home')}</div>

        <h2 className="mt-8 text-2xl font-bold">{t('assignments.label')}</h2>
        <div className="w-full mt-4 overflow-x-auto ">
          <AssignmentOverview />
        </div>

        <div className="flex flex-row justify-end w-full ">
          <Link
            to="/student/assignments"
            className="font-bold hover:cursor-pointer hover:underline"
          >
            {t('assignments.view_all')}
            <i className="fa-solid ml-1.5 fa-arrow-right"></i>
          </Link>
        </div>

        <p className="text-2xl mt-8 font-bold">{t('classes.label')}</p>
        <div className="w-full mt-4">
          <ClassesStudent />
        </div>
      </div>
    </>
  );
}
