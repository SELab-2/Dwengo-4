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
            ? "bg-green-700 pt-1 text-white border-gray-600 border-3"
            : "pt-1.5 bg-lime-500 text-white hover:bg-lime-600"
        }`;
      }}
    >
      {label}
    </NavLink>
  );
};

export default NavButton;
