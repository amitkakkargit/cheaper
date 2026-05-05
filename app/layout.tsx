import type { Metadata } from "next";
import AccountMenu from "@/components/AccountMenu";
import AppFooter from "@/components/AppFooter";
import JsonLd from "@/components/JsonLd";
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  siteConfig,
} from "@/lib/seo";
import "./styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
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
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={buildWebsiteJsonLd()} />
        <JsonLd data={buildOrganizationJsonLd()} />
        <header className="app-header">
          <a href="/" className="brand-link">
            Cheaper
          </a>
          <AccountMenu />
        </header>
        {children}
        <AppFooter />
      </body>
    </html>
  );
}
