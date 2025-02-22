import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Container from "../shared/Container";
import styles from "./Nav.module.css";

const NavAdmin = () => {
   const [menuOpen, setMenuOpen] = useState(false);

   // Functie om menu te openen/sluiten
   const toggleMenu = () => {
      setMenuOpen(!menuOpen);
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
               >
                  <span></span>
                  <span></span>
                  <span></span>
               </div>

               {/* Menu Items */}
               <div
                  className={`${styles.navLinks} ${menuOpen ? styles.open : ""
                     }`}
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
            </div>
         </Container>
      </nav>
   );
};

export default NavAdmin;