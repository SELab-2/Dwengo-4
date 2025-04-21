import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className="px-7 h-10 font-medium rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300 hover:cursor-pointer"
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
