import localFont from "next/font/local";

/** Signed-in display serif. Never import from layout.tsx or app/login. */
export const displaySerif = localFont({
  src: "./Newsreader-opsz-wght500-latin.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-display",
  adjustFontFallback: "Times New Roman",
  fallback: ["Iowan Old Style", "Georgia", "Times New Roman", "serif"],
});
