import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`px-7 h-10 font-bold rounded-md  bg-lime-500 text-white hover:bg-lime-600`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
