import React from "react";

const BoxBorder = ({ children, extraClasses, ...props }) => {
   return (
      <div className={`border-medium py-20 px-20 ${extraClasses}`} {...props}>
         {children}
      </div>
      
   );
};

export default BoxBorder;
