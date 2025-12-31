import React, { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { darkTheme } from "./dark";
import { lightTheme } from "./light";
import { useAppStore } from "@store/useAppStore";

type ThemeValue = {
  scheme: "light" | "dark";
  isDark: boolean;
  theme: typeof lightTheme;
};

const ThemeContext = createContext<ThemeValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme() === "dark" ? "dark" : "light";
  const darkModeOverride = useAppStore((s) => s.settings.darkMode);
  const scheme = darkModeOverride ? "dark" : system;
  const value = useMemo<ThemeValue>(
    () => ({ scheme, isDark: scheme === "dark", theme: scheme === "dark" ? darkTheme : lightTheme }),
    [scheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}