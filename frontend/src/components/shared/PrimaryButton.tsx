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
      className={`px-7 h-10 font-bold rounded-md text-white  bg-dwengo-green hover:bg-dwengo-green-dark hover:cursor-pointer`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
