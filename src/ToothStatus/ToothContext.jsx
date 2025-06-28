import React, { createContext, useState, useContext, useCallback } from 'react';

const ToothContext = createContext();

export const ToothProvider = ({ children }) => {
  const [toothState, setToothState] = useState({
    toothToRedraw: null,
    updatedProperties: {}
  });

  const requestRedraw = useCallback((toothId, properties = {}) => {
    setToothState({
      toothToRedraw: toothId,
      updatedProperties: properties
    });
    
    // Reset after triggering
    setTimeout(() => {
      setToothState({
        toothToRedraw: null,
        updatedProperties: {}
      });
    }, 100);
  }, []);

  return (
    <ToothContext.Provider value={{ toothState, requestRedraw }}>
      {children}
    </ToothContext.Provider>
  );
};

export const useToothContext = () => useContext(ToothContext);