import React from "react";
import { NavLink, useSubmit } from "react-router-dom";
import "./SideBar.css";

const SideBarTeacher = () => {
   const submit = useSubmit();

   const handleLogout = (e) => {
      e.preventDefault();
      submit(null, { action: "/teacher/logout", method: "post" });
   };

   return (
      <aside className={`py-20 px-30 bg-lg aside`}>
         <div className="g-20">
            <h2>Teacher Dashboard</h2>
            <nav className="navLinks">
               <NavLink 
                  to="/teacher/dashboard" 
                  end
                  className={({ isActive }) => isActive ? "active" : ""}
               >
                  Home
               </NavLink>
               <NavLink 
                  to="/teacher/dashboard/klassen" 
                  className={({ isActive }) => isActive ? "active" : ""}
               >
                  Mijn Klassen
               </NavLink>
               <NavLink 
                  to="/teacher/dashboard/opdrachten" 
                  className={({ isActive }) => isActive ? "active" : ""}
               >
                  Opdrachten Beheren
               </NavLink>
               <NavLink 
                  to="/teacher/dashboard/resultaten" 
                  className={({ isActive }) => isActive ? "active" : ""}
               >
                  Studenten Resultaten
               </NavLink>
               <NavLink 
                  to="/teacher/dashboard/profiel" 
                  className={({ isActive }) => isActive ? "active" : ""}
               >
                  Mijn Profiel
               </NavLink>
            </nav>
         </div>
         <div>
            <button onClick={handleLogout} className="logoutButton">Uitloggen</button>
         </div>
      </aside>
   );
};

export default SideBarTeacher;
