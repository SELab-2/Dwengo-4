import React from 'react';

const PrimaryButton = ({ children, ...props }) => {
  return (
    <button {...props} className="btn-primary" >
      {children}
    </button>
  );
};

export default PrimaryButton;
