import { useState, useEffect } from "react";

export type ThemeMode = "dark" | "light";

const THEME_KEY = "placepro_theme";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));
  const setTheme = (mode: ThemeMode) => setThemeState(mode);

  return { theme, toggleTheme, setTheme };
}
