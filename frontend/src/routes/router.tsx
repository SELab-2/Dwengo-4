import React from 'react';
import {
  createBrowserRouter,
  RouteObject,
  Outlet,
  Link,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageChooser from '../components/shared/LanguageChooser';

// ==== TEACHER PAGES & LAYOUTS ====
import RootLayoutTeacher from '../components/teacher/RootLayoutTeacher';
import LoginTeacher from '../pages/teacher/LoginTeacher';
import SignupTeacher from '../pages/teacher/SignupTeacher';
import { action as teacherLogoutAction } from '../pages/teacher/LogoutTeacher';
import {
  checkAuthLoader as teacherCheckAuthLoader,
} from '../util/teacher/authTeacher';

import TeacherIndex from '../pages/teacher/TeacherIndex';
import ClassesPage from '../pages/teacher/ClassesTeacher';
import EditClassTeacher from '../pages/teacher/EditClassTeacher';
import Assignment from '../pages/teacher/Assignment';
import AssignmentAdd from '../pages/teacher/AssignmentAdd';
import AssignmentEdit from '../pages/teacher/AssignmentEdit';

// ==== STUDENT PAGES & LAYOUTS ====
import RootLayoutStudent from '../components/student/RootLayoutStudent';
import LoginStudent from '../pages/student/LoginStudent';
import SignupStudent from '../pages/student/SignupStudent';
import { action as studentLogoutAction } from '../pages/student/LogoutStudent';
import {
  checkAuthLoader as studentCheckAuthLoader,
} from '../util/student/authStudent';

import StudentIndex from '../pages/student';
import StudentClassIndex from '../pages/student/StudentClassIndex';
import JoinClass from '../components/student/classes/JoinRequestForm';

// ==== LEARNING PATHS ====
import LearningPaths from '../pages/learningPath/learningPaths';
import LearningPath from '../pages/learningPath/learningPath';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="absolute top-4 right-4"><LanguageChooser/></div>
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="font-bold text-5xl mb-8">{t('role.choose')}</h2>
        <div className="flex gap-x-10">
          <Link to="/student">
            <button className="px-7 text-4xl py-1.5 font-bold rounded-md bg-dwengo-green hover:bg-dwengo-green-dark text-white">
              {t('role.student')}
            </button>
          </Link>
          <Link to="/teacher">
            <button className="px-7 text-4xl py-1.5 font-bold rounded-md bg-dwengo-green hover:bg-dwengo-green-dark text-white">
              {t('role.teacher')}
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export const router = createBrowserRouter([
  // ── Algemeen ──
  { path: '/', element: <HomePage /> },
  { path: '/learning-path/:pathId', element: <LearningPath /> },

  // ── Teacher ──
  {
    path: '/teacher',
    element: <RootLayoutTeacher />,
    children: [
      // 1) publieke routes
      { path: 'inloggen', element: <LoginTeacher /> },
      { path: 'registreren', element: <SignupTeacher /> },

      // 2) protected routes in een pathless group
      {
        element: <Outlet />,
        loader: teacherCheckAuthLoader,
        children: [
          { index: true, element: <TeacherIndex /> },
          { path: 'logout', action: teacherLogoutAction },
          { path: 'classes', element: <ClassesPage /> },
          { path: 'classes/:classId', element: <EditClassTeacher /> },
          { path: 'classes/:classId/add-assignment', element: <AssignmentAdd /> },
          { path: 'add-assignment', element: <AssignmentAdd /> },
          { path: 'assignment/:assignmentId', element: <Assignment /> },
          { path: 'assignment/:assignmentId/edit', element: <AssignmentEdit /> },
          { path: 'learning-paths', element: <LearningPaths /> },
          { path: 'learning-path/:pathId', element: <LearningPath /> },
        ],
      },
    ],
  },

  // ── Student ──
  {
    path: '/student',
    element: <RootLayoutStudent />,
    children: [
      // 1) publieke routes
      { path: 'inloggen', element: <LoginStudent /> },
      { path: 'registreren', element: <SignupStudent /> },

      // 2) protected routes in een pathless group
      {
        element: <Outlet />,
        loader: studentCheckAuthLoader,
        children: [
          { index: true, element: <StudentIndex /> },
          { path: 'logout', action: studentLogoutAction },
          { path: 'klassen', element: <JoinClass /> },
          { path: 'class/:classId', element: <StudentClassIndex /> },
          { path: 'learning-path/:pathId', element: <LearningPath /> },
        ],
      },
    ],
  },
] as RouteObject[]);
