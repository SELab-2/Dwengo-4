import React, { MouseEvent } from "react";
import { NavLink, useSubmit } from "react-router-dom";
import styles from "./SideBar.module.css";

const SideBarStudent: React.FC = () => {
  const submit = useSubmit();

  const handleLogout = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submit(null, { action: "/student/logout", method: "post" });
  };

  return (
    <aside className={`py-20 px-30 bg-lg ${styles.aside}`}>
      <div className="g-20">
        <h2>Student Dashboard</h2>
        <nav className={styles.navLinks}>
          <NavLink to="/student/dashboard">Home</NavLink>
          <NavLink to="/student/dashboard/klassen">Mijn Klassen</NavLink>
          <NavLink to="/student/dashboard/opdrachten">Opdrachten</NavLink>
          <NavLink to="/student/dashboard/resultaten">Mijn Resultaten</NavLink>
          <NavLink to="/student/dashboard/profiel">Mijn Profiel</NavLink>
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

export default SideBarStudent;
