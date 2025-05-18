import React, { lazy } from 'react';
import { createBrowserRouter, Link, RouteObject } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageChooser from '../components/shared/LanguageChooser';
import { LPEditProvider } from '../context/LearningPathEditContext';
import { action as teacherLogoutAction } from '../pages/teacher/LogoutTeacher';
import { action as studentLogoutAction } from '../pages/student/LogoutStudent';

// ==== TEACHER ROUTES ==== //
const Assignment = lazy(() => import('../pages/teacher/Assignment'));
const AssignmentAdd = lazy(() => import('../pages/teacher/AssignmentAdd'));
const AssignmentEdit = lazy(() => import('../pages/teacher/AssignmentEdit'));
const Assignments = lazy(() => import('../pages/teacher/Assignments'));

const RootLayoutTeacher = lazy(
  () => import('../components/teacher/RootLayoutTeacher'),
);
const LoginTeacher = lazy(() => import('../pages/teacher/LoginTeacher'));
const ClassesPage = lazy(() => import('../pages/teacher/ClassesTeacher'));
const SignupTeacher = lazy(() => import('../pages/teacher/SignupTeacher'));

const EditClassTeacher = lazy(
  () => import('../pages/teacher/EditClassTeacher'),
);
const TeacherIndex = lazy(() => import('../pages/teacher/TeacherIndex'));
const EditLearningPath = lazy(
  () => import('../pages/teacher/EditLearningPath'),
);

// ==== STUDENT ROUTES ==== //
const RootLayoutStudent = lazy(
  () => import('../components/student/RootLayoutStudent'),
);
const LoginStudent = lazy(() => import('../pages/student/LoginStudent'));
const SignupStudent = lazy(() => import('../pages/student/SignupStudent'));

const StudentIndex = lazy(() => import('../pages/student'));
const JoinClass = lazy(
  () => import('../components/student/classes/JoinRequestForm'),
);
const AssignmentStudent = lazy(
  () => import('../pages/student/AssignmentStudent'),
);
const AssignmentsStudent = lazy(
  () => import('../pages/student/AssignmentsStudent'),
);
const QuestionOverview = lazy(
  () => import('../pages/student/QuestionOverview'),
);
const QuestionsForAssignment = lazy(
  () => import('@/pages/student/QuestionsForAssignment'),
);
const StudentClassIndex = lazy(
  () => import('../pages/student/StudentClassIndex'),
);

// ==== LEARNING PATHS ==== //
const LearningPaths = lazy(() => import('../pages/learningPath/learningPaths'));
const LearningPath = lazy(() => import('../pages/learningPath/learningPath'));
const NewQuestion = lazy(() => import('@/pages/student/NewQuestion'));

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="absolute top-4 right-4">
        <LanguageChooser />
      </div>
      <div className="flex flex-col justify-center items-center h-screen bg-cover bg-center">
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
    path: '/learning-paths/:pathId',
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
        path: 'assignments',
        element: <Assignments></Assignments>,
      },
      {
        path: 'learning-paths/create',
        element: (
          <LPEditProvider isCreateMode={true}>
            <EditLearningPath />
          </LPEditProvider>
        ),
      },
      {
        path: 'learning-paths/:learningPathId/edit',
        element: (
          <LPEditProvider isCreateMode={false}>
            <EditLearningPath />
          </LPEditProvider>
        ),
      },
      {
        path: 'learning-paths',
        element: <LearningPaths />,
      },
      {
        path: 'learning-paths/:pathId',
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
        path: 'assignment/:assignmentId',
        element: <AssignmentStudent></AssignmentStudent>,
      },
      {
        path: 'assignments',
        element: <AssignmentsStudent></AssignmentsStudent>,
      },
      {
        path: 'questions/:assignmentId',
        element: <QuestionsForAssignment></QuestionsForAssignment>,
      },
      {
        path: 'question/:questionId',
        element: <QuestionOverview></QuestionOverview>,
      },
      {
        path: 'question/new/:assignmentId',
        element: <NewQuestion></NewQuestion>,
      },
      {
        path: 'learning-paths',
        element: <LearningPaths />,
      },
      {
        path: 'learning-paths/:pathId',
        element: <LearningPath />,
      },
    ],
  },
] as RouteObject[]);
