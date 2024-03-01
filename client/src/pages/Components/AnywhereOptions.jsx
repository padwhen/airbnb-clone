// ContinentContext.js
import React, { createContext, useContext, useState } from "react";

const ContinentContext = createContext();

const continents = ["Asia", "Africa", "North America", "South America", "Europe", "Oceania", "Anywhere"];

export const useContinent = () => {
  const context = useContext(ContinentContext);
  if (!context) {
    throw new Error("useContinent must be used within a ContinentProvider");
  }
  return context;
};

export const ContinentProvider = ({ children }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Anywhere");

  const setContinent = (continent) => {
    setSelectedOption(continent);
    setShowOptions(false);
  };

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  return (
    <ContinentContext.Provider value={{ showOptions, toggleOptions, selectedOption, setContinent }}>
      {children}
    </ContinentContext.Provider>
  );
};

export const AnywhereOptions = () => {
  const { showOptions, selectedOption, toggleOptions, setContinent } = useContinent();

  return (
    <div className={`flex gap-5 pt-2 max-h-0 rounded-full justify-items-start pl-[99px] ${showOptions ? 'visible' : 'hidden'}`}>
      {continents.map((continent) => (
        <div className={`border rounded-full ${selectedOption === continent ? 'selected' : ''}`} key={continent} onClick={() => setContinent(continent)}>
          {continent}
        </div>
      ))}
    </div>
  );
};

export const extractCountryFromAddress = (address, continentData) => {
    const wordsInAddress = address.split(/\s+/)
    const lastWord = wordsInAddress[wordsInAddress.length - 1]
    for (const continent in continentData) {
        const countriesInContinent = continentData[continent]
        if (countriesInContinent.some(country => lastWord.includes(country))) {
            return continent
        }
    }
    return null
}
