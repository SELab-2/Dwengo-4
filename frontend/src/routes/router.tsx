import React from 'react';
import {
  createBrowserRouter,
  RouteObject,
  useNavigate,
} from 'react-router-dom';

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

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="-translate-y-20">
        <h2 className="justify-center flex flex-row font-bold text-5xl mb-8">
          Kies een rol
        </h2>
        <div className="flex flex-row justify-center gap-x-10">
          <button
            onClick={() => navigate('/student')}
            className={`px-7 text-4xl py-1.5 font-bold rounded-md  bg-dwengo-green hover:bg-dwengo-green-dark text-white  hover:cursor-pointer`}
          >
            Student
          </button>
          <button
            className={`px-7 text-4xl py-1.5 font-bold rounded-md   text-white bg-dwengo-green hover:bg-dwengo-green-dark hover:cursor-pointer`}
            onClick={() => navigate('/teacher')}
          >
            Teacher
          </button>
        </div>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/learning-paths',
    element: <div>Learning Path</div>,
  },
  {
    path: 'teacher',
    element: <RootLayoutTeacher />,
    children: [
      {
        index: true,
        element: <h1>Home teacher</h1>,
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
        path: 'assignments/:assignmentId',
        element: <Assignment></Assignment>,
      },
      {
        path: 'assignments/:assignmentId/edit',
        element: <AssignmentEdit></AssignmentEdit>,
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
