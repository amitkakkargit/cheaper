import type { ProductWithSeller } from "@/lib/types";
import { getAllProducts } from "@/lib/api";
import HomeFeed from "@/components/HomeFeed";

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Nearby discounts, curated daily</p>
          <h1>Swipe the cheapest useful products around you.</h1>
          <p className="hero-copy">
            Browse second-hand gems, fresh bargains, and quality finds in a
            responsive Instagram-style marketplace.
          </p>
        </div>
      </section>
      <HomeFeed products={products} />
    </main>
  );
}
