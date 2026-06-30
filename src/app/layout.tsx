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

const siteUrl = process.env.NEXTAUTH_URL || "https://vizualizatorpro.si";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VizualizatorPRO — AI vizualizacije za prodajo balkonskih ograd in keramike",
    template: "%s | VizualizatorPRO",
  },
  description:
    "Profesionalno orodje za izvajalce: fotorealistične AI vizualizacije balkonskih ograd (WPC, Inox, Steklo) in keramike. Stranka vidi rezultat pred nakupom — ko vidi, kupi takoj.",
  keywords: [
    "AI vizualizacija",
    "balkonske ograje",
    "WPC ograje",
    "keramika",
    "ControlNet",
    "prodaja gradbenih storitev",
    "Slovenija",
    "AR vizualizacija",
    "PDF ponudba",
    "multi-tenant SaaS",
  ],
  authors: [{ name: "VizualizatorPRO", url: siteUrl }],
  creator: "VizualizatorPRO",
  publisher: "VizualizatorPRO",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VizualizatorPRO",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "sl-SI": "/",
      "en-US": "/",
      "de-DE": "/",
      "it-IT": "/",
    },
  },
  openGraph: {
    title: "VizualizatorPRO — AI vizualizacije za prodajo",
    description:
      "Fotorealistične vizualizacije ograj in keramike. Ko stranka vidi rezultat, kupi takoj. WPC, Inox, Steklo + AR vizualizacija + PDF ponudbe.",
    url: siteUrl,
    siteName: "VizualizatorPRO",
    locale: "sl_SI",
    alternateLocale: ["en_US", "de_DE", "it_IT"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VizualizatorPRO - AI vizualizacije za prodajo balkonskih ograd in keramike",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VizualizatorPRO — AI vizualizacije za prodajo",
    description:
      "Fotorealistične vizualizacije ograj in keramike. Ko stranka vidi rezultat, kupi takoj.",
    images: ["/og-image.png"],
    creator: "@vizualizatorpro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "google-site-verification-code-here",
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f59e0b" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured data (JSON-LD) za SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VizualizatorPRO",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    description:
      "AI vizualizacije za prodajo balkonskih ograd in keramike. WPC, Inox, Steklo + AR + PDF ponudbe.",
    publisher: {
      "@type": "Organization",
      name: "VizualizatorPRO",
      url: siteUrl,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: "1",
    },
  }

  return (
    <html lang="sl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Skip to content - accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
        >
          Preskoči na vsebino
        </a>
        <Providers>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
