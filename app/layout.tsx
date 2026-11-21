import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "N + M",
  description: "Nóri & Max se marient, dans la petite maison dans les bois.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fefefe",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preload" href="/assets/forest-wind/background.png" as="image" />
      </head>
      <body>{children}</body>
    </html>
  );
}
