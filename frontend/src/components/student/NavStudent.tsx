import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Container from "../shared/Container";
import styles from "./Nav.module.css";

const NavStudent: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string | null>(localStorage.getItem('firstName'));

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav>
      <Container>
        <div className={styles.nav}>
          {/* Logo */}
          <div className="mxw-200">
            <h2>DWENGO</h2>
          </div>

          {/* Hamburger Icon */}
          <div
            className={styles.hamburger}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                toggleMenu();
              }
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Menu Items */}
          <div className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
            {firstName ? (
              <span>Welcome {firstName}!</span>
            ) : (
              <>
                <NavLink to="/student/inloggen" className="t-h-d-u" onClick={toggleMenu}>
                  Inloggen
                </NavLink>
                <NavLink to="/student/registreren" onClick={toggleMenu}>
                  Maak Account
                </NavLink>
              </>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default NavStudent;
