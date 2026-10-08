import type { Metadata, Viewport } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import { siteUrl } from "@/lib/shared";
import "./global.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

const description =
  "A headless React component for showing popovers on text selection, with zero dependencies.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "React Highlight Popover",
    template: "%s | React Highlight Popover",
  },
  description,
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
    url: siteUrl,
    title: "React Highlight Popover",
    description,
    siteName: "React Highlight Popover",
  },
  twitter: {
    card: "summary_large_image",
    title: "React Highlight Popover",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "Technology",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
