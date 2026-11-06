import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from 'react';
import ClientLoader from './components/ClientLoader';
import UserTracker from './components/UserTracker';
import BanOverlay from './components/BanOverlay';
import SiteStatus from './components/SiteStatus';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leo Game",
  description: "Play. Create. Connect. The ultimate platform for players and creators.",
  manifest: "/manifest.json", // 指向 PWA 設定檔
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#06b6d4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}>
        <Suspense fallback={null}>
          <SiteStatus />
          <ClientLoader />
          <UserTracker />
          <BanOverlay />
        </Suspense>
        {children}
      </body>
    </html>
  );
}