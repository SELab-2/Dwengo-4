import React, { MouseEvent } from "react";
import { NavLink, useSubmit } from "react-router-dom";
import "./SideBar.css";

const SideBarStudent: React.FC = () => {
  const submit = useSubmit();

  const handleLogout = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submit(null, { action: "/student/logout", method: "post" });
  };

  return (
    <aside className={`py-10 px-30 bg-lg aside`}>
       <div className="g-20">
          <h2>Student Dashboard</h2>
          <nav className="navLinks">
             <NavLink
                className={({ isActive }) => isActive ? "active" : ""}
                end
                to="/student/dashboard">Home</NavLink>
             <NavLink
                className={({ isActive }) => isActive ? "active" : ""}
                to="/student/dashboard/klassen">Mijn Klassen</NavLink>
             <NavLink
                className={({ isActive }) => isActive ? "active" : ""}
                to="/student/dashboard/opdrachten">Opdrachten</NavLink>
             <NavLink
                className={({ isActive }) => isActive ? "active" : ""}
                to="/student/dashboard/resultaten">Mijn Resultaten</NavLink>
             <NavLink
                className={({ isActive }) => isActive ? "active" : ""}
                to="/student/dashboard/profiel">Mijn Profiel</NavLink>
          </nav>
       </div>
       <div>
          <button onClick={handleLogout} className="logoutButton">Uitloggen</button>
       </div>
    </aside>
 );
};

export default SideBarStudent;
