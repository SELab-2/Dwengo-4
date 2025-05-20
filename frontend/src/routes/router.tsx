import React, { lazy } from 'react';
import {
  createBrowserRouter,
  Link,
  RouteObject,
  Outlet, // ➜ toegevoegd voor de path-less groepen
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageChooser from '../components/shared/LanguageChooser';
import { LPEditProvider } from '../context/LearningPathEditContext';
import { action as teacherLogoutAction } from '../pages/teacher/LogoutTeacher';
import { action as studentLogoutAction } from '../pages/student/LogoutStudent';

// ✅ AUTH-LOADERS (nieuw)
import { checkAuthLoader as teacherCheckAuthLoader } from '../util/teacher/authTeacher';
import { checkAuthLoader as studentCheckAuthLoader } from '../util/student/authStudent';

/* -------------------------------------------------------------------------- */
/*                              LAZY COMPONENTS                               */
/* -------------------------------------------------------------------------- */

// ==== TEACHER ROUTES ==== //
const Assignment = lazy(() => import('../pages/teacher/Assignment'));
const AssignmentAdd = lazy(() => import('../pages/teacher/AssignmentAdd'));
const AssignmentEdit = lazy(() => import('../pages/teacher/AssignmentEdit'));
const Assignments = lazy(() => import('../pages/teacher/Assignments'));

const RootLayoutTeacher = lazy(
  () => import('../components/teacher/RootLayoutTeacher'),
);
const LoginTeacher = lazy(() => import('../pages/teacher/LoginTeacher'));
const SignupTeacher = lazy(() => import('../pages/teacher/SignupTeacher'));
const ClassesPage = lazy(() => import('../pages/teacher/ClassesTeacher'));
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

const LeaderBoard = lazy(() => import('../pages/student/LeaderBoard'));
const QuestionOverviewTeacher = lazy(
  () => import('../pages/teacher/QuestionOverview'),
);

const LocalLearningObjectsPage = lazy(
  () => import('@/pages/teacher/LocalLearningObject'),
);

// ==== LEARNING PATHS ==== //

const LearningPaths = lazy(() => import('../pages/learningPath/learningPaths'));
const LearningPath = lazy(() => import('../pages/learningPath/learningPath'));
const NewQuestion = lazy(() => import('@/pages/student/NewQuestion'));

/* -------------------------------------------------------------------------- */
/*                                   PAGES                                    */
/* -------------------------------------------------------------------------- */

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
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                ROUTER TREE                                 */
/* -------------------------------------------------------------------------- */

export const router = createBrowserRouter([
  /* ---------- Algemeen ---------- */
  { path: '/', element: <HomePage /> },
  { path: '/learning-paths/:pathId', element: <LearningPath /> },

  /* ---------- Teacher ---------- */
  {
    path: 'teacher',
    element: <RootLayoutTeacher />,
    children: [
      /* --- Publiek --- */
      { path: 'inloggen', element: <LoginTeacher /> },
      { path: 'registreren', element: <SignupTeacher /> },
      { path: 'leaderboard', element: <LeaderBoard /> },

      /* --- Protected --- */
      {
        element: <Outlet />,
        loader: teacherCheckAuthLoader,
        children: [
          { index: true, element: <TeacherIndex /> },
          { path: 'logout', action: teacherLogoutAction },
          { path: 'classes', element: <ClassesPage /> },
          { path: 'classes/:classId', element: <EditClassTeacher /> },
          {
            path: 'classes/:classId/add-assignment',
            element: <AssignmentAdd />,
          },
          { path: 'add-assignment', element: <AssignmentAdd /> },
          { path: 'assignment/:assignmentId', element: <Assignment /> },
          {
            path: 'assignment/:assignmentId/edit',
            element: <AssignmentEdit />,
          },
          {
            path: 'assignments',
            element: <Assignments></Assignments>,
          },
          {
            path: 'question/:questionId',
            element: <QuestionOverviewTeacher />,
          },
          {
            path: 'local-learning-objects',
            element: <LocalLearningObjectsPage></LocalLearningObjectsPage>,
          },
          {
            path: 'learning-paths/create',
            element: (
              <LPEditProvider isCreateMode>
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
          { path: 'learning-paths', element: <LearningPaths /> },
          { path: 'learning-paths/:pathId', element: <LearningPath /> },
        ],
      },
    ],
  },

  /* ---------- Student ---------- */
  {
    path: 'student',
    element: <RootLayoutStudent />,
    children: [
      /* --- Publiek --- */
      { path: 'inloggen', element: <LoginStudent /> },
      { path: 'registreren', element: <SignupStudent /> },
      { path: 'leaderboard', element: <LeaderBoard /> },

      /* --- Protected --- */
      {
        element: <Outlet />,
        loader: studentCheckAuthLoader,
        children: [
          { index: true, element: <StudentIndex /> },
          { path: 'logout', action: studentLogoutAction },
          { path: 'klassen', element: <JoinClass /> },
          { path: 'class/:classId', element: <StudentClassIndex /> },
          { path: 'assignment/:assignmentId', element: <AssignmentStudent /> },
          { path: 'assignments', element: <AssignmentsStudent /> },
          {
            path: 'questions/:assignmentId',
            element: <QuestionsForAssignment />,
          },
          { path: 'question/:questionId', element: <QuestionOverview /> },
          { path: 'question/new/:assignmentId', element: <NewQuestion /> },
          { path: 'learning-paths', element: <LearningPaths /> },
          { path: 'learning-paths/:pathId', element: <LearningPath /> },
        ],
      },
    ],
  },
] as RouteObject[]);
