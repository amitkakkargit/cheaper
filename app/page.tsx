import type { Metadata } from "next";
import type { ProductWithSeller } from "@/lib/types";
import { getAllProducts } from "@/lib/api";
import HomeFeed from "@/components/HomeFeed";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Nearby Local Deals",
  description:
    "Browse nearby products by search, category, location, price, condition, seller rating, and confirmed local marketplace reviews.",
  path: "/",
});

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <main className="page-shell">
      <JsonLd
        data={buildBreadcrumbJsonLd([{ name: "Home", path: "/" }])}
      />
      {/* <section className="hero-panel">
        <div>
          <p className="eyebrow">Nearby discounts, curated daily</p>
          <h1>Swipe the cheapest useful products around you.</h1>
          <p className="hero-copy">
            Browse second-hand gems, fresh bargains, and quality finds in a
            responsive Instagram-style marketplace.
          </p>
        </div>
      </section> */}
      <HomeFeed products={products} />
    </main>
  );
}
