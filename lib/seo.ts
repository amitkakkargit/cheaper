import type { Metadata } from "next";
import type { ProductWithSeller, Rating, Seller } from "@/lib/types";

export const siteConfig = {
  name: "Cheaper",
  title: "Cheaper Local Marketplace",
  description:
    "Find nearby products, meet sellers in person, confirm the handoff, and review trusted local deals.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "en_US",
  twitterHandle: "@cheaper",
};

export const absoluteUrl = (path = "/") => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
};

export const buildPageMetadata = ({
  title,
  description,
  path,
  image,
  type = "website",
  robotsIndex = true,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  robotsIndex?: boolean;
}): Metadata => {
  const url = absoluteUrl(path);
  const resolvedImage = image ? absoluteUrl(image) : undefined;
  const images = resolvedImage ? [{ url: resolvedImage, alt: title }] : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: robotsIndex,
      follow: true,
      googleBot: {
        index: robotsIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: siteConfig.twitterHandle,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
};

export const buildWebsiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: `${absoluteUrl("/")}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildOrganizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  sameAs: [],
});

export const buildBreadcrumbJsonLd = (
  items: Array<{ name: string; path: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

const itemConditionMap: Record<string, string> = {
  New: "https://schema.org/NewCondition",
  "Second-hand": "https://schema.org/UsedCondition",
  Used: "https://schema.org/UsedCondition",
  Refurbished: "https://schema.org/RefurbishedCondition",
};

export const buildProductJsonLd = (
  product: ProductWithSeller,
  ratings: Rating[],
) => {
  const image = product.images?.[0] || product.imageUrl;
  const aggregateRating =
    product.productRatingCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: product.productRatingAverage,
          reviewCount: product.productRatingCount,
          bestRating: 5,
          worstRating: 1,
        }
      : ratings.length
        ? {
            "@type": "AggregateRating",
            ratingValue:
              ratings.reduce((sum, rating) => sum + rating.score, 0) /
              ratings.length,
            reviewCount: ratings.length,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: image ? [absoluteUrl(image)] : undefined,
    category: product.category,
    sku: product.id,
    itemCondition:
      itemConditionMap[product.condition] || "https://schema.org/UsedCondition",
    brand: {
      "@type": "Brand",
      name: product.sellerName,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.id}`),
      priceCurrency: "INR",
      price: product.currentPrice,
      availability: "https://schema.org/InStock",
      itemCondition:
        itemConditionMap[product.condition] ||
        "https://schema.org/UsedCondition",
      seller: {
        "@type": "Organization",
        name: product.sellerName,
      },
      areaServed: product.location,
    },
    aggregateRating,
  };
};

export const buildSellerJsonLd = (
  seller: Seller,
  ratingCount: number,
  averageRating: number,
) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: seller.name,
  description: seller.bio,
  url: absoluteUrl(`/seller/${seller.id}`),
    image: seller.avatarUrl ? absoluteUrl(seller.avatarUrl) : undefined,
  address: {
    "@type": "PostalAddress",
    addressLocality: seller.location,
  },
  geo:
    seller.latitude && seller.longitude
      ? {
          "@type": "GeoCoordinates",
          latitude: seller.latitude,
          longitude: seller.longitude,
        }
      : undefined,
  aggregateRating:
    ratingCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: averageRating,
          reviewCount: ratingCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
});
