import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          50: "#FAF9F6",
          100: "#F4F3EE",
          200: "#EAE7DF",
          300: "#DED9CD",
        },
        blood: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          950: "#450A0A",
        },
        ochre: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        forest: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        ink: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gentle: "0 2px 10px -2px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.04)",
        card: "0 4px 20px -4px rgba(15, 23, 42, 0.07), 0 2px 6px -2px rgba(15, 23, 42, 0.04)",
        elevated: "0 10px 30px -6px rgba(15, 23, 42, 0.1), 0 4px 10px -3px rgba(15, 23, 42, 0.06)",
        emergency: "0 0 0 4px rgba(220, 38, 38, 0.25), 0 12px 32px -4px rgba(185, 28, 28, 0.3)",
      },
      animation: {
        "subtle-pulse": "subtlePulse 3s ease-in-out infinite",
        "emergency-pulse": "emergencyPulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        subtlePulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        emergencyPulse: {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(220, 38, 38, 0.4)" },
          "50%": { transform: "scale(1.02)", boxShadow: "0 0 0 12px rgba(220, 38, 38, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
