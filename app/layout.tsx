import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl, siteConfig } from "../lib/site";
import { Analytics } from "@vercel/analytics/next"

const siteUrl = getSiteUrl();
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteUrl,
      keywords: siteConfig.keywords.join(", ")
    },
    {
      "@type": "WebApplication",
      name: siteConfig.name,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      description: siteConfig.description,
      url: siteUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteConfig.name,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name
  },
  alternates: {
    canonical: siteUrl
  },
  category: "technology",
  creator: siteConfig.creditName,
  publisher: siteConfig.creditName,
  authors: [
    {
      name: siteConfig.creditName,
      url: siteConfig.creditUrl || undefined
    }
  ],
  keywords: siteConfig.keywords,
  verification: {
    google: siteConfig.googleSiteVerification || undefined
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    url: siteUrl,
    siteName: siteConfig.name,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TikTok Wrapped share preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: siteConfig.xHandle || undefined,
    images: ["/opengraph-image"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
