import { Newsreader } from "next/font/google";

/** Signed-in display serif. Never import from layout.tsx or app/login. */
export const displaySerif = Newsreader({
  subsets: ["latin"],
  style: ["normal"],
  display: "swap",
  preload: false,
  variable: "--font-display",
});
