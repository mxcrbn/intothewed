import type { Metadata, Viewport } from "next";
import { Marcellus } from "next/font/google";
import "./globals.css";

// the invitation's serif: light, flared, widely tracked (latin-ext for Hungarian ő, ű)
const serif = Marcellus({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: "N + M",
  description: "Nóri & Max — Cegléd, Hungary, August 2027.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fefefe",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={serif.variable}>
      <head>
        <link rel="preload" href="/assets/trees/background.png" as="image" />
      </head>
      <body>{children}</body>
    </html>
  );
}
