// Deployment Trigger: 2026-04-04 04:10
import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, DM_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import MobileTabBar from "@/components/MobileTabBar";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: ["400"],
  subsets: ["latin"],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: 'swap',
});

const barlowCond = Barlow_Condensed({
  variable: "--font-barlow-cond",
  weight: ["700", "800"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TrueServe | Order Food Delivery Near You",
  description: "Order from your favorite local restaurants. Fast delivery, real-time driver tracking, and menus you'll love — all in one place.",
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable} ${barlowCond.variable}`}>
      <body className="antialiased">
        {children}
        <MobileTabBar />
      </body>
    </html>
  );
}
