import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "React Highlight Popover",
  description:
    "A customizable, headless React component for creating popovers on text selection, with zero dependencies.",
  keywords: [
    "React",
    "highlight",
    "text selection",
    "popover",
    "headless",
    "zero-dependency",
  ],
  creator: "Josh Daniel Bañares",
  openGraph: {
    type: "website",
    url: "https://react-highlight-popover.omsimos.com",
    title: "React Highlight Popover",
    description:
      "Create customizable popovers on text selection with this zero-dependency React component.",
    siteName: "React Highlight Popover",
  },
  twitter: {
    card: "summary_large_image",
    title: "React Highlight Popover",
    description:
      "Create customizable popovers on text selection with this zero-dependency React component.",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  themeColor: "#ffffff",
  alternates: {
    canonical: "https://react-highlight-popover.omsimos.com",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>{children}</body>
    </html>
  );
}
