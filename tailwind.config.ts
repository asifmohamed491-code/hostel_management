// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6E42F5",
          light: "#8B5CF6",
          dark: "#5B2FE0",
        },
        secondary: "#8B5CF6",
        lavender: "#F4F1FD",
        heading: "#3E1F73",
      },
      fontFamily: {
        sans: ["Inter Variable", "Inter", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
        card: "24px",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(110, 66, 245, 0.12)",
        "glass-lg": "0 20px 60px 0 rgba(110, 66, 245, 0.18)",
        "card-float": "0 12px 40px 0 rgba(76, 29, 149, 0.15)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out",
        shine: "shine 1.1s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;