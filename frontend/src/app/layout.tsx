import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Baseline — chart, today’s sky, grounded protocols",
  description:
    "Your natal chart, today’s sky, kit-aware Protocols, and Soul — informational, not medical advice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-canvas text-fg antialiased`}>
        <AppProvider>
          <Header />
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
