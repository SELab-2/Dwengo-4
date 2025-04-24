import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavButtonProps {
  to: string;
  label: string;
  isActive?: (path: string) => boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        return `px-7 font-bold rounded-md  ${
          isActive
            ? 'bg-dwengo-green-darker pt-1 text-white border-gray-800 border-3'
            : 'py-1.5 bg-dwengo-green hover:bg-dwengo-green-dark text-white '
        }`;
      }}
      end
    >
      {label}
    </NavLink>
  );
};

export default NavButton;
