"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeSettings {
  mode: "dark" | "light";
  backgroundImage?: string;
  accentColor: string;
  primaryColor: string;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (settings: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeSettings = {
  mode: "dark",
  accentColor: "#ff0000",
  primaryColor: "#ffffff",
  backgroundImage: undefined,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved) {
      try {
        setTheme(JSON.parse(saved));
      } catch {
        setTheme(defaultTheme);
      }
    }
  }, []);

  const updateTheme = (settings: Partial<ThemeSettings>) => {
    const newTheme = { ...theme, ...settings };
    setTheme(newTheme);
    localStorage.setItem("theme", JSON.stringify(newTheme));
    applyTheme(newTheme);
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.setItem("theme", JSON.stringify(defaultTheme));
    applyTheme(defaultTheme);
  };

  const applyTheme = (t: ThemeSettings) => {
    const root = document.documentElement;
    
    if (t.mode === "dark") {
      root.style.setProperty("--bg-primary", "#000000");
      root.style.setProperty("--bg-secondary", "rgba(0, 0, 0, 0.7)");
      root.style.setProperty("--text-primary", t.primaryColor);
      root.style.setProperty("--text-secondary", "#aaa");
    } else {
      root.style.setProperty("--bg-primary", "#ffffff");
      root.style.setProperty("--bg-secondary", "rgba(255, 255, 255, 0.9)");
      root.style.setProperty("--text-primary", "#1a1a1a");
      root.style.setProperty("--text-secondary", "#666");
    }

    root.style.setProperty("--accent-color", t.accentColor);
    root.style.setProperty("--primary-color", t.primaryColor);

    if (t.backgroundImage) {
      document.body.style.backgroundImage = `url('${t.backgroundImage}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.body.style.backgroundImage = "none";
    }
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
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

