import type React from "react";
import { createContext, useContext } from "react";

// Simplified theme context - no dark/light theme functionality
type ThemeContextType = {
  // Reserved for future theme-related functionality if needed
  initialized: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Simple provider without theme state management
  const value = {
    initialized: true,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
