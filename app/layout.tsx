import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLoader from './components/ClientLoader';
import UserTracker from './components/UserTracker';
import BanOverlay from './components/BanOverlay';
import SiteStatus from './components/SiteStatus'; // 引入全站狀態組件

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
  description: "Leo Game Platform - Play. Create. Connect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}>
        <SiteStatus />      {/* 跑馬燈與維護遮罩 */}
        <ClientLoader />    {/* 開頭載入畫面 */}
        <UserTracker />     {/* 抓取真實 IP 與設備指紋 */}
        <BanOverlay />      {/* 紅色封禁遮罩 */}
        {children}
      </body>
    </html>
  );
}