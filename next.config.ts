import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The site is published on GitHub Pages (noriandmax.com) as plain files: `next build` writes
  // them to out/ (see .github/workflows/pages.yml). Pages become folders (/rsvp/index.html).
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
