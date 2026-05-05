import type { Metadata } from "next";
import { Kalam, Playfair_Display } from "next/font/google";
import "./globals.css";
import MobileNavWrapper from "@/components/MobileNavWrapper";
import LaunchDarklyClientProvider from "@/components/LaunchDarklyClientProvider";
import { Suspense } from "react";
import DynamicBranding from "@/components/DynamicBranding";

const kalam = Kalam({
  variable: "--font-kalam",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "TrueServe | Next-Gen Delivery Infrastructure",
  description: "Empowering independent restaurants through fair logistics, elite driver fleets, and seamless Toast POS integrations.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${kalam.variable} ${playfair.variable} bg-black text-slate-200 antialiased pb-24 md:pb-0 font-sans overflow-x-hidden`}
        suppressHydrationWarning
      >
        <LaunchDarklyClientProvider>
          <Suspense fallback={null}>
            <DynamicBranding />
          </Suspense>
          {children}
          <MobileNavWrapper />
        </LaunchDarklyClientProvider>

        {/* Global Scroll Reveal Script */}
        <script dangerouslySetInnerHTML={{ __html: `
          const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
          };

          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
              }
            });
          }, observerOptions);

          document.addEventListener('DOMContentLoaded', () => {
             document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach(el => observer.observe(el));
          });

          // Also handle dynamic content (SPA transitions)
          const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
              mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                  if (node.matches('.reveal, .reveal-left, .reveal-scale')) observer.observe(node);
                  node.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach(el => observer.observe(el));
                }
              });
            });
          });
          mutationObserver.observe(document.body, { childList: true, subtree: true });
        `}} />
      </body>
    </html>
  );
}
