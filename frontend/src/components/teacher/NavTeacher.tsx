import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { action } from "../../pages/teacher/LogoutTeacher";
import Container from "../shared/Container";
import styles from "./Nav.module.css";

const NavTeacher: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string | null>(
    localStorage.getItem("firstName")
  );

  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
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
            >
              <span></span>
              <span></span>
              <span></span>
            </div>

            {/* Menu Items */}
            {firstName ? (
              <span>Ingelogd als {firstName}!</span>
            ) : (
              <div
                className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}
              >
                <NavLink
                  to="/teacher/inloggen"
                  className="t-h-d-u"
                  onClick={toggleMenu}
                >
                  Inloggen
                </NavLink>
                <NavLink to="/teacher/registreren" onClick={toggleMenu}>
                  Maak Account
                </NavLink>
              </div>
            )}
          </div>
        </Container>
      </nav>
    </>
  );
};

export default NavTeacher;
