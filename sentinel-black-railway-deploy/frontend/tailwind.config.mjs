/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.{css}"
  ],
  theme: {
    extend: {
      colors: {
        sb: {
          bg: "#0A0A0C",
          surface: "#111218",
          surfaceAlt: "#181A22",
          border: "#232533",
          borderStrong: "#3A3D4D",

          blue: "#3A9BFF",
          purple: "#A45CFF",
          cyan: "#3FF0D4",

          red: "#FF3B5C",
          amber: "#FFB547",
          green: "#4CD964",

          text: "#F5F6FA",
          textSecondary: "#A4A7B5",
          textMuted: "#6B6E7C"
        }
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "999px"
      },
      boxShadow: {
        neon: "0 0 12px rgba(58,155,255,0.35)",
        neonPurple: "0 0 12px rgba(164,92,255,0.35)"
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "20px"
      }
    }
  },
  plugins: []
};
