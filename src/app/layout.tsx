import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegister } from "@/components/vizualizator/sw-register";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VizualizatorPRO — AI vizualizacije za prodajo balkonskih ograd in keramike",
  description: "Profesionalno orodje za izvajalce: fotorealistične AI vizualizacije balkonskih ograd (WPC, Inox, Steklo) in keramike. Stranka vidi rezultat pred nakupom — ko vidi, kupi takoj.",
  keywords: ["AI vizualizacija", "balkonske ograje", "WPC ograje", "keramika", "ControlNet", "prodaja gradbenih storitev", "Slovenija"],
  authors: [{ name: "VizualizatorPRO" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VizualizatorPRO",
  },
  openGraph: {
    title: "VizualizatorPRO — AI vizualizacije za prodajo",
    description: "Fotorealistične vizualizacije ograj in keramike. Ko stranka vidi rezultat, kupi takoj.",
    type: "website",
    locale: "sl_SI",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
