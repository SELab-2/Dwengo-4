import React from 'react';
import SidebarButton, { SidebarSection } from './SidebarButton';

interface SidebarProps {
  className: string | undefined;
  activeSection: SidebarSection;
  onChange: (s: SidebarSection) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  activeSection,
  onChange,
}) => {
  const render = (s: SidebarSection, l: string) => (
    <SidebarButton
      key={s}
      section={s}
      label={l}
      activeSection={activeSection}
      onClick={onChange}
    />
  );

  return (
    <div className="w-64 bg-gray-100 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Dashboard voor {className}</h2>
      <div className="flex flex-col gap-2">
        {render('overview', 'Overview')}
        {render('assignments', 'Assignments')}
        {render('questions', 'Questions')}
        {render('manage', 'Manage')}
      </div>
    </div>
  );
};

export default Sidebar;
