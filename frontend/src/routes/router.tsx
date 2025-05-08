import React from 'react';
import { createBrowserRouter, Link, RouteObject } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageChooser from '../components/shared/LanguageChooser';

// ==== TEACHER ROUTES ==== //
import Assignment from '../pages/teacher/Assignment';
import AssignmentAdd from '../pages/teacher/AssignmentAdd';
import AssignmentEdit from '../pages/teacher/AssignmentEdit';

import RootLayoutTeacher from '../components/teacher/RootLayoutTeacher';
import LoginTeacher from '../pages/teacher/LoginTeacher';
import ClassesPage from '../pages/teacher/ClassesTeacher';
import SignupTeacher from '../pages/teacher/SignupTeacher';
import { action as teacherLogoutAction } from '../pages/teacher/LogoutTeacher';
import EditClassTeacher from '../pages/teacher/EditClassTeacher';
import TeacherIndex from '../pages/teacher/TeacherIndex';

// ==== STUDENT ROUTES ==== //
import RootLayoutStudent from '../components/student/RootLayoutStudent';
import LoginStudent from '../pages/student/LoginStudent';
import SignupStudent from '../pages/student/SignupStudent';
import RootLayoutDashboardStudent from '../components/student/RootLayoutDashboardStudent';
import {
  checkAuthLoader as studentCheckAuthLoader,
  tokenLoader as studentTokenLoader,
} from '../util/student/authStudent';
import { action as studentLogoutAction } from '../pages/student/LogoutStudent';
import StudentIndex from '../pages/student';
import JoinClass from '../components/student/classes/JoinRequestForm';
import StudentClassIndex from '../pages/student/StudentClassIndex';

// ==== LEARNING PATHS ==== //
import LearningPaths from '../pages/learningPath/learningPaths';
import LearningPath from '../pages/learningPath/learningPath';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="absolute top-4 right-4">
        <LanguageChooser />
      </div>
      # TODO: zoek een image zodat de achtergrond niet saai wit is
      <div className="flex flex-col justify-center items-center h-screen bg-[url('/path-to-your-image.jpg')] bg-cover bg-center">
        <div className="-translate-y-20">
          <h2 className="justify-center flex flex-row font-bold text-5xl mb-8">
            {t('role.choose')}
          </h2>
          <div className="flex flex-row justify-center gap-x-10">
            <Link to="/student">
              <button
                className={`px-7 text-4xl py-1.5 font-bold rounded-md  bg-dwengo-green hover:bg-dwengo-green-dark text-white  hover:cursor-pointer`}
              >
                {t('role.student')}
              </button>
            </Link>
            <Link to="/teacher">
              <button
                className={`px-7 text-4xl py-1.5 font-bold rounded-md   text-white bg-dwengo-green hover:bg-dwengo-green-dark hover:cursor-pointer`}
              >
                {t('role.teacher')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/learning-path/:pathId',
    element: <LearningPath />,
  },
  {
    path: 'teacher',
    element: <RootLayoutTeacher />,
    children: [
      {
        index: true,
        element: <TeacherIndex />,
      },
      {
        path: 'inloggen',
        element: <LoginTeacher />,
      },
      {
        path: 'registreren',
        element: <SignupTeacher />,
      },
      {
        path: 'logout',
        action: teacherLogoutAction,
      },
      {
        path: 'classes',
        element: <ClassesPage></ClassesPage>,
      },
      {
        path: 'classes/:classId',
        element: <EditClassTeacher />,
      },
      {
        path: 'classes/:classId/add-assignment',
        element: <AssignmentAdd></AssignmentAdd>,
      },
      {
        path: 'add-assignment',
        element: <AssignmentAdd></AssignmentAdd>,
      },
      {
        path: 'assignment/:assignmentId',
        element: <Assignment></Assignment>,
      },
      {
        path: 'assignment/:assignmentId/edit',
        element: <AssignmentEdit></AssignmentEdit>,
      },
      {
        path: 'learning-paths',
        element: <LearningPaths />,
      },
      {
        path: 'learning-path/:pathId',
        element: <LearningPath />,
      },
    ],
  },
  {
    path: 'student',
    element: <RootLayoutStudent />,
    children: [
      {
        index: true,
        // Je kunt hier eventueel een aparte HomeStudent-component gebruiken
        element: <StudentIndex />,
      },
      {
        path: 'class/:classId',
        element: <StudentClassIndex />,
      },
      {
        path: 'klassen',
        element: <JoinClass />,
      },
      {
        path: 'inloggen',
        element: <LoginStudent />,
      },
      {
        path: 'registreren',
        element: <SignupStudent />,
      },
      {
        path: 'logout',
        action: studentLogoutAction,
      },
      {
        path: 'learning-path/:pathId',
        element: <LearningPath />,
      },
      {
        path: 'dashboard',
        element: <RootLayoutDashboardStudent />,
        loader: studentTokenLoader,
        children: [
          {
            index: true,
            element: <h1>Home Student</h1>,
            loader: studentCheckAuthLoader,
          },
        ],
      },
    ],
  },
] as RouteObject[]);
