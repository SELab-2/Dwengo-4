import React from "react";
import { NavLink } from "react-router-dom";

interface NavButtonProps {
  to: string;
  label: string;
  isActive?: (path: string) => boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ to, label, isActive }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive: linkIsActive }) => {
        const active = isActive ? isActive(to) : linkIsActive;
        return `px-7 h-10 font-bold rounded-md  ${
          active
            ? "bg-dwengo-green-darker pt-1 text-white border-gray-800 border-3"
            : "pt-1.5 bg-dwengo-green hover:bg-dwengo-green-dark text-white "
        }`;
      }}
    >
      {label}
    </NavLink>
  );
};

export default NavButton;
