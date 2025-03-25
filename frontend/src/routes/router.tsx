import React from "react";
import {
  createBrowserRouter,
  Link,
  RouteObject,
  useNavigate,
} from "react-router-dom";

// ==== TEACHER ROUTES ==== //
import RootLayoutTeacher from "../components/teacher/RootLayoutTeacher";
import LoginTeacher from "../pages/teacher/LoginTeacher";
import ClassesPage from "../pages/teacher/ClassesTeacher";
import SignupTeacher from "../pages/teacher/SignupTeacher";
import RootLayoutDashboardTeacher from "../components/teacher/RootLayoutDashboardTeacher";
import {
  checkAuthLoader as teacherCheckAuthLoader,
  tokenLoader as teacherTokenLoader,
} from "../util/teacher/authTeacher";
import { action as teacherLogoutAction } from "../pages/teacher/LogoutTeacher";
import EditClassTeacher from "../pages/teacher/EditClassTeacher";

// ==== STUDENT ROUTES ==== //
import RootLayoutStudent from "../components/student/RootLayoutStudent";
import LoginStudent from "../pages/student/LoginStudent";
import SignupStudent from "../pages/student/SignupStudent";
import RootLayoutDashboardStudent from "../components/student/RootLayoutDashboardStudent";
import {
  checkAuthLoader as studentCheckAuthLoader,
  tokenLoader as studentTokenLoader,
} from "../util/student/authStudent";
import { action as studentLogoutAction } from "../pages/student/LogoutStudent";
import StudentIndex from "../pages/student";

const HomePage: React.FC = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h2>Kies een rol:</h2>
    <Link to="/student" className="link mx-10">
      Student
    </Link>
    <Link to="/teacher" className="link mx-10">
      Teacher
    </Link>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "teacher",
    element: <RootLayoutTeacher />,
    children: [
      {
        index: true,
        element: <h1>Home teacher</h1>,
      },
      {
        path: "inloggen",
        element: <LoginTeacher />,
      },
      {
        path: "registreren",
        element: <SignupTeacher />,
      },
      {
        path: "logout",
        action: teacherLogoutAction,
      },
      {
        path: "dashboard",
        element: <RootLayoutDashboardTeacher />,
        loader: teacherTokenLoader,
        children: [
          {
            index: true,
            element: <h1>Teacher Dashboard</h1>,
            loader: teacherCheckAuthLoader,
          },
          {
            path: "klassen",
            element: <ClassesPage></ClassesPage>,
            loader: teacherCheckAuthLoader,
          },
        ],
      },
      {
        path: "classes/:classId",
        element: <EditClassTeacher />,
      },
    ],
  },
  {
    path: "student",
    element: <RootLayoutStudent />,
    children: [
      {
        index: true,
        // Je kunt hier eventueel een aparte HomeStudent-component gebruiken
        element: <StudentIndex />,
      },
      {
        path: "join-link-example",
        element: <p>Join Link Example</p>,
      },
      {
        path: "inloggen",
        element: <LoginStudent />,
      },
      {
        path: "registreren",
        element: <SignupStudent />,
      },
      {
        path: "logout",
        action: studentLogoutAction,
      },
      {
        path: "dashboard",
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
