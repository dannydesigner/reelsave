import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reelsave.me';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ReelSave - Free TikTok & Instagram Video Downloader",
  description: "Download TikTok videos without watermark in HD, save Instagram Reels, videos, photos, and Facebook clips. Fast, free, and unlimited online downloader.",
  keywords: [
    "tiktok downloader",
    "download tiktok without watermark",
    "instagram downloader",
    "instagram video downloader",
    "instagram reels downloader",
    "tiktok mp4 download",
    "tiktok watermark remover",
    "convert tiktok to mp4",
    "social video downloader",
    "reelsave"
  ],
  authors: [{ name: "Codeora Labs" }],
  openGraph: {
    title: "ReelSave - Free TikTok & Instagram Video Downloader",
    description: "Download TikTok videos without watermark in HD, save Instagram Reels, videos, photos, and Facebook clips. Fast, free, and unlimited online downloader.",
    type: "website",
    url: siteUrl,
    siteName: "ReelSave",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#f6f4ef] text-[#161613]">
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
