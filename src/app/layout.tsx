import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NSCA LAB | CSCS & NSCA-CPT 合格伴走PWA",
  description: "問題集ではなく、合格までの習慣をつくる学習PWAプラットフォーム。今日の5問、弱点分析、模擬試験、間違いノート、学習計画ロードマップで合格まで伴走します。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NSCA LAB",
  },
  applicationName: "NSCA LAB",
  other: {
    "mobile-web-app-capable": "yes",
  }
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 flex justify-center items-stretch">
        {/* Mobile Mockup Shell Wrapper */}
        <div className="phone-container w-full min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
          <main className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </main>
          
          {/* Navigation & Prompts */}
          <Navigation />
        </div>

        {/* Client-side Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
