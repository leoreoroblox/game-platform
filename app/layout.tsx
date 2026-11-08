import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from 'react';

import ClientLoader from './components/ClientLoader';
import UserTracker from './components/UserTracker';
import BanOverlay from './components/BanOverlay';
import SiteStatus from './components/SiteStatus';
import UpdateNotifier from './components/UpdateNotifier';
import Navbar from './components/Navbar'; 
import Sidebar from './components/Sidebar'; 
import AuthGuard from './components/AuthGuard'; 

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
        
        {/* 🚀 用 Suspense 包住 AuthGuard，解決 Next.js 的 Segment 警告 */}
        <Suspense fallback={<div className="min-h-screen bg-[#050810]" />}>
          <AuthGuard>
            <Suspense fallback={null}>
              <SiteStatus />
              <ClientLoader />
              <UserTracker />
              <BanOverlay />
              <UpdateNotifier />
            </Suspense>

            <Navbar /> 
            
            <div className="flex min-h-screen pt-16">
              <Suspense fallback={<div className="w-64 bg-gray-950 hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-gray-800" />}>
                <Sidebar />
              </Suspense>
              
              <main className="flex-1 md:ml-64 w-full">
                {children}
              </main>
            </div>
          </AuthGuard>
        </Suspense>

      </body>
    </html>
  );
}