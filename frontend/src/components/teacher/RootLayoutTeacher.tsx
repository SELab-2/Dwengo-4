import { Outlet } from 'react-router-dom';
import Nav from './NavTeacher';
import React from 'react';

function RootLayoutTeacher() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Navigation */}
      <header className="shadow bg-white">
        <Nav />
      </header>

      {/* Main content wrapper */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-xl p-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default RootLayoutTeacher;
