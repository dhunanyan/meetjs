import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development";
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
const appFavicon = "https://dhunanyan.com/favicon.ico";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "MSW Beyond Tests Demo",
  title: {
    default: "MSW Beyond Tests - Next.js Demo",
    template: "%s | MSW Beyond Tests",
  },
  description: "Developer-focused MSW demo in a Next.js App Router app",
  keywords: [
    "nextjs",
    "msw",
    "mock-service-worker",
    "frontend",
    "meetjs",
    "demo",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "MSW Beyond Tests Demo",
    title: "MSW Beyond Tests - Next.js Demo",
    description: "Developer-focused MSW demo in a Next.js App Router app",
    images: [{ url: appFavicon }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MSW Beyond Tests - Next.js Demo",
    description: "Developer-focused MSW demo in a Next.js App Router app",
    images: [appFavicon],
  },
  icons: {
    icon: [{ url: appFavicon }],
    shortcut: [{ url: appFavicon }],
    apple: [{ url: appFavicon }],
  },
  robots: allowIndexing
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
        },
      },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-app-env={appEnv}>
      <body>{children}</body>
    </html>
  );
}
