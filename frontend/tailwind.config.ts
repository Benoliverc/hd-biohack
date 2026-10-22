import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        elevated: "var(--elevated)",
        sunken: "var(--sunken)",
        border: {
          DEFAULT: "var(--border)",
        },
        fg: {
          DEFAULT: "var(--fg)",
          secondary: "var(--fg-secondary)",
          muted: "var(--fg-muted)",
          inverse: "var(--fg-inverse)",
        },
        growth: {
          DEFAULT: "var(--growth)",
          ink: "var(--growth-ink)",
          deep: "var(--growth-deep)",
          soft: "var(--growth-soft)",
        },
        energy: {
          DEFAULT: "var(--energy)",
          ink: "var(--energy-ink)",
          soft: "var(--energy-soft)",
        },
        recovery: "var(--recovery)",
        danger: "var(--danger)",
        focus: "var(--focus)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px color-mix(in srgb, var(--fg) 4%, transparent)",
      },
    },
  },
  plugins: [],
};
export default config;
