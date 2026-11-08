import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from 'react';

import ClientLoader from './components/ClientLoader';
import UserTracker from './components/UserTracker';
import BanOverlay from './components/BanOverlay';
import SiteStatus from './components/SiteStatus';
import UpdateNotifier from './components/UpdateNotifier';
import Navbar from './components/Navbar'; // 🚀 把 Navbar 放到全局
import Sidebar from './components/Sidebar'; // 🚀 引入側邊欄

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leo Game",
  description: "Play. Create. Connect. The ultimate platform for players and creators.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
          <UpdateNotifier />
        </Suspense>

        {/* 全局頂部導航 */}
        <Navbar /> 
        
        {/* 全局佈局：左側選單 + 右側內容 */}
        <div className="flex min-h-screen pt-16">
          <Sidebar />
          {/* 🚀 右側內容區：因為左邊有 64 (w-64) 的側邊欄，所以主內容區需要左邊距 ml-64 */}
          <main className="flex-1 md:ml-64 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}