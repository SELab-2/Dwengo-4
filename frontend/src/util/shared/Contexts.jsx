import React, { createContext, useContext, useEffect, useState } from 'react';

const FirstNameContext = createContext(null);

export const FirstNameProvider = ({ children }) => {
  const [firstName, setFirstName] = useState(() => {
    // Haal de initiële waarde uit localStorage
    return localStorage.getItem('firstName') || '';
  });

  useEffect(() => {
    // Update localStorage wanneer de state verandert
    localStorage.setItem('firstName', firstName);
  }, [firstName]);

  return (
    <FirstNameContext.Provider value={{ firstName, setFirstName }}>
      {children}
    </FirstNameContext.Provider>
  );
};

export const useFirstNameContext = () => {
  return useContext(FirstNameContext);
};
