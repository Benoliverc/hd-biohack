import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HD Biohack — Human Design + Protocols",
  description: "V1 Human Design chart, daily transits, and biohacking protocols",
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
