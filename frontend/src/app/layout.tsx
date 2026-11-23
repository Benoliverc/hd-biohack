import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { LiteracyHowToReadProvider } from "@/components/LiteracyHowToReadContext";
import { AppShell } from "@/components/AppShell";
import { PageViewTracker } from "@/components/PageViewTracker";

const inter = Inter({ subsets: ["latin"] });

const previewBase =
  process.env.VERCEL_ENV &&
  process.env.VERCEL_ENV !== "production" &&
  process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL("https://hdbaseline.com");

export const metadata: Metadata = {
  metadataBase: previewBase,
  title: "Baseline — chart, today’s sky, grounded protocols",
  description:
    "Your natal chart, today’s sky, Protocols that use what you already own, and Soul — informational, not medical advice.",
  openGraph: {
    title: "Baseline — chart, today’s sky, grounded protocols",
    description:
      "Your natal chart, today’s sky, Protocols that use what you already own, and Soul — informational, not medical advice.",
    url: "https://hdbaseline.com",
    siteName: "HD Baseline",
    type: "website",
    images: [
      {
        url: "/og/share-1200x630.png",
        width: 1200,
        height: 630,
        alt: "HD Baseline — Baseline. Chart · Today · Protocols · Soul.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Baseline — chart, today’s sky, grounded protocols",
    description:
      "Your natal chart, today’s sky, Protocols that use what you already own, and Soul — informational, not medical advice.",
    images: ["/og/share-1200x630.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-canvas text-fg antialiased`}>
        <Script id="baseline-session-presence-boot" strategy="beforeInteractive">
          {`try{if(localStorage.getItem("hd-biohack:session-token")){document.documentElement.setAttribute("data-baseline-session-pending","1")}}catch(e){}`}
        </Script>
        <AppProvider>
          <LiteracyHowToReadProvider>
            <Header />
            <PageViewTracker />
            <AppShell>{children}</AppShell>
          </LiteracyHowToReadProvider>
        </AppProvider>
      </body>
    </html>
  );
}
