import { Outlet } from "react-router-dom";
import Nav from "./NavTeacher";
import React from "react";

function RootLayoutTeacher() {
  return (
    <>
      <Nav />

      <main>
        {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
        <Outlet />
      </main>
    </>
  );
}

export default RootLayoutTeacher;
