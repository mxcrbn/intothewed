import type { Metadata, Viewport } from "next";
import { Marcellus } from "next/font/google";
import "./globals.css";

// the invitation's serif: light, flared, widely tracked (latin-ext for Hungarian ő, ű)
const serif = Marcellus({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap" });

const title = "Nóri & Max";
const description = "Nóri & Max — Cegléd, Hungary, August 2027.";
export const metadata: Metadata = {
  metadataBase: new URL("https://noriandmax.com"),
  title,
  description,
  // the site is for our guests: search engines are asked not to list it (the link still works, and
  // still shows its picture when shared)
  robots: { index: false, follow: false },
  // what a shared link shows: the drawing (public/share.jpg, built by tools/make_share_image.py)
  openGraph: {
    type: "website",
    url: "/",
    title,
    description,
    images: [{ url: "/share.jpg", width: 1200, height: 630, alt: "The little house in the woods, drawn in pencil" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/share.jpg"] },
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
        <link rel="preload" href="/assets/trees/background.webp" as="image" type="image/webp" />
      </head>
      <body>{children}</body>
    </html>
  );
}
