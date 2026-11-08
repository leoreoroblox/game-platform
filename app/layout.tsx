import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from 'react';

import ClientLoader from './components/ClientLoader';
import UserTracker from './components/UserTracker';
import BanOverlay from './components/BanOverlay';
import SiteStatus from './components/SiteStatus';
import UpdateNotifier from './components/UpdateNotifier'; // 🚀 引入更新彈窗

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
  manifest: "/manifest.json",
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
          <UpdateNotifier /> {/* 🚀 放在這裡，全站生效 */}
        </Suspense>
        {children}
      </body>
    </html>
  );
}