import React from "react";

interface LoadingIndicatorButtonProps {
  dark?: boolean; 
}

const LoadingIndicatorButton: React.FC<LoadingIndicatorButtonProps> = ({ dark }) => {
  return (
    <div className={`loading-indicator ${dark ? "dark" : ""}`}>
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  );
};

export default LoadingIndicatorButton;
