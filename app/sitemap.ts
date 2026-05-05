import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const products = await getAllProducts();
    const productRoutes = products.map((product) => ({
      url: absoluteUrl(`/product/${product.id}`),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
    const sellerRoutes = Array.from(
      new Set(products.map((product) => product.sellerId)),
    ).map((sellerId) => ({
      url: absoluteUrl(`/seller/${sellerId}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes, ...sellerRoutes];
  } catch {
    return staticRoutes;
  }
}
