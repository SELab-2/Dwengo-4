import React from 'react';

export type SidebarSection = 'overview' | 'assignments' | 'questions' | 'manage';

interface SidebarButtonProps {
  section: SidebarSection;
  label: string;
  activeSection: SidebarSection;
  onClick: (section: SidebarSection) => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  section,
  label,
  activeSection,
  onClick,
}) => {
  const isActive = section === activeSection;

  return (
    <button
      onClick={() => onClick(section)}
      className={`cursor-pointer px-7 h-10 font-bold rounded-md ${
        isActive
          ? 'bg-dwengo-green-darker pt-1 text-white border-gray-600 border-3'
          : 'pt-1.5 bg-dwengo-green hover:bg-dwengo-green-dark text-white'
      }`}
    >
      {label}
    </button>
  );
};

export default SidebarButton;
