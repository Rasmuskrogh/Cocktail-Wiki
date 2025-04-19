import { createContext, useState, ReactNode, useContext } from "react";

// context to keep track of if user wants to see only non-alcoholic drinks on landing page

export const CheckBoxContext = createContext<{
  isNonAlcoholic: boolean;
  setIsNonAlcoholic?: (isNonAlcoholic: boolean) => void;
}>({
  isNonAlcoholic: false,
});

// context provider: what is passed with the context
export const CheckboxProvider = ({ children }: { children: ReactNode }) => {
  const [isNonAlcoholic, setIsNonAlcoholic] = useState(false);

  return (
    <CheckBoxContext.Provider value={{ isNonAlcoholic, setIsNonAlcoholic }}>
      {children}
    </CheckBoxContext.Provider>
  );
};

export const useCheckboxContext = () => useContext(CheckBoxContext);
