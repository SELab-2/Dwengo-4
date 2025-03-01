import React from "react";

const LoadingIndicatorButton = ({dark}) => {
  return (
    <div className={`loading-indicator ${dark ? "dark" : ""}`}>
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  );
};

export default LoadingIndicatorButton;
