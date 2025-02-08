import React, { createContext, useState } from 'react';

export const AirportContext = createContext();

export const AirportProvider = ({ children }) => {
  const [airport, onSelectAirport] = useState(null);

  return (
    <AirportContext.Provider value={{ airport, onSelectAirport }}>
      {children}
    </AirportContext.Provider>
  );
};
