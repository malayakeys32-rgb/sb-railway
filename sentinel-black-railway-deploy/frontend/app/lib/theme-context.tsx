"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface Theme {
  mode: "dark" | "light";
  accentColor: string;
  glowColor: string;
  backgroundImage: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME: Theme = {
  mode: "dark",
  accentColor: "#ff4d8d",
  glowColor: "#ffffff",
  backgroundImage: "",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved) {
      setThemeState(JSON.parse(saved));
    }
  }, []);

  const setTheme = (updates: Partial<Theme>) => {
    setThemeState((prev) => {
      const newTheme = { ...prev, ...updates };
      localStorage.setItem("theme", JSON.stringify(newTheme));
      applyTheme(newTheme);
      return newTheme;
    });
  };

  const resetTheme = () => {
    setThemeState(DEFAULT_THEME);
    localStorage.setItem("theme", JSON.stringify(DEFAULT_THEME));
    applyTheme(DEFAULT_THEME);
  };

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    root.style.setProperty("--accent-color", t.accentColor);
    root.style.setProperty("--glow-color", t.glowColor);
    if (t.backgroundImage) {
      root.style.backgroundImage = `url('${t.backgroundImage}')`;
    }
    root.classList.toggle("dark", t.mode === "dark");
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
