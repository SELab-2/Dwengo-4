import { Outlet, useLoaderData, useSubmit } from 'react-router-dom';
import Nav from './NavTeacher';
import React, { useEffect } from 'react';
import { getTokenDuration } from '@/util/teacher/authTeacher';

function RootLayoutTeacher() {

  const token = useLoaderData();
  const submit = useSubmit();

  useEffect(() => {
    if (!token) {
      return;
    }

    if (token === "EXPIRED") {
      submit(null, { action: "/logout", method: "post" });
      return;
    }
    if (token === "EXPIRED") {
      submit(null, { action: "/logout", method: "post" });
      return;
    }

    const tokenDuration = getTokenDuration();

    setTimeout(() => {
      submit(null, { action: "/logout", method: "post" });
    }, tokenDuration);
  }, [token, submit]);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Navigation */}
      <header className="shadow bg-white">
        <Nav />
      </header>

      {/* Main content wrapper */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-xl p-6 max-w-screen-xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default RootLayoutTeacher;
