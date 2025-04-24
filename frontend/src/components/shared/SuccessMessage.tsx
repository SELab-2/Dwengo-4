import React from 'react';
import './SuccessMessage.css';

type SuccessMessageProps = {
  title: string;
  description: string;
};

const SuccessMessage: React.FC<SuccessMessageProps> = ({ title, description }) => {
  return (
    <div className={`border-medium py-10 px-10 succesBox`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default SuccessMessage;