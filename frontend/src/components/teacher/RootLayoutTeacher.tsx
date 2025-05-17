import { Outlet } from 'react-router-dom';
import Nav from './NavTeacher';
import React from 'react';

function RootLayoutTeacher() {
  return (
    <div className="min-h-screen bg-dwengo-neutral-ivory flex flex-col bg-gray-50 text-gray-900">
      {/* Navigation */}
      <header className="shadow">
        <Nav />
      </header>

      {/* Main content wrapper */}
      <main className="flex-1 bg-dwengo-neutral-ivory px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-dwengo-neutral-ivory p-6 max-w-screen-xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default RootLayoutTeacher;
