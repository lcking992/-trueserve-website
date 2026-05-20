// Deployment Trigger: 2026-04-04 04:10
import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import MobileTabBar from "@/components/MobileTabBar";
import CustomerSupportLauncher from "@/components/CustomerSupportLauncher";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: 'swap',
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
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
    <html lang="en" className={`${dmSans.variable} ${plusJakarta.variable} ${fraunces.variable} ${dmMono.variable}`}>
      <body className="antialiased">
        {children}
        <CustomerSupportLauncher />
        <MobileTabBar />
      </body>
    </html>
  );
}
