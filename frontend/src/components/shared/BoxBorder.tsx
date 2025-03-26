import React, { ReactNode, HTMLAttributes } from "react";

interface BoxBorderProps extends HTMLAttributes<HTMLDivElement> {
   children: ReactNode;
   extraClasses?: string;
}

const BoxBorder: React.FC<BoxBorderProps> = ({ children, extraClasses = "", ...props }) => {
   return (
      <div className={`border-medium py-20 px-20 ${extraClasses}`} {...props}>
         {children}
      </div>
   );
};

export default BoxBorder;
