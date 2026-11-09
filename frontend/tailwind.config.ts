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
        soft: "0 1px 2px color-mix(in srgb, var(--fg) 5%, transparent), 0 4px 14px color-mix(in srgb, var(--fg) 6%, transparent)",
      },
      fontSize: {
        "type-display": ["1.875rem", { lineHeight: "1.25", fontWeight: "700" }],
        "type-title": ["1.5rem", { lineHeight: "1.25", fontWeight: "600", letterSpacing: "-0.025em" }],
        "type-section": ["1.125rem", { lineHeight: "1.375", fontWeight: "600" }],
        "type-body": ["1rem", { lineHeight: "1.625" }],
        "type-meta": ["0.875rem", { lineHeight: "1.5", fontWeight: "500" }],
        "type-caption": ["0.75rem", { lineHeight: "1.5", fontWeight: "500" }],
        "type-chip": ["0.75rem", { lineHeight: "1.5", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};
export default config;
