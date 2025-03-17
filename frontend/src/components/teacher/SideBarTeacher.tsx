import React, { MouseEvent } from "react";
import { NavLink, useSubmit } from "react-router-dom";
import styles from "./SideBar.module.css";

const SideBarTeacher: React.FC = () => {
  const submit = useSubmit();

  const handleLogout = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submit(null, { action: "/teacher/logout", method: "post" });
  };

  return (
    <aside className={`py-20 px-30 bg-lg ${styles.aside}`}>
      <div className="g-20">
        <h2>Teacher Dashboard</h2>
        <nav className={styles.navLinks}>
          <NavLink to="/teacher/dashboard">Home</NavLink>
          <NavLink to="/teacher/dashboard/klassen">Mijn Klassen</NavLink>
          <NavLink to="/teacher/dashboard/opdrachten">Opdrachten Beheren</NavLink>
          <NavLink to="/teacher/dashboard/resultaten">Studenten Resultaten</NavLink>
          <NavLink to="/teacher/dashboard/profiel">Mijn Profiel</NavLink>
        </nav>
      </div>
      <div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Uitloggen
        </button>
      </div>
    </aside>
  );
};

export default SideBarTeacher;
