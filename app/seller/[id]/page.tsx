import type { Metadata } from "next";
import Link from "next/link";
import {
  getSellerById,
  getProductsBySeller,
  getSellerRatings,
} from "@/lib/api";
import JsonLd from "@/components/JsonLd";
import RatingStars from "@/components/RatingStars";
import ProductCard from "@/components/ProductCard";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildSellerJsonLd,
} from "@/lib/seo";

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: SellerPageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await getSellerById(id);

  if (!seller) {
    return buildPageMetadata({
      title: "Seller Not Found",
      description: "This Cheaper seller profile could not be found.",
      path: `/seller/${id}`,
      robotsIndex: false,
    });
  }

  return buildPageMetadata({
    title: `${seller.name} Local Seller Profile`,
    description: `${seller.name} is a Cheaper local seller in ${seller.location}. ${seller.bio}`,
    path: `/seller/${seller.id}`,
    image: seller.avatarUrl || undefined,
  });
}

export default async function SellerDetailPage({ params }: SellerPageProps) {
  const { id } = await params;
  const seller = await getSellerById(id);
  if (!seller) return <div className="page-shell">Seller not found</div>;

  const products = await getProductsBySeller(seller.id);
  const sellerRatings = await getSellerRatings(seller.id);
  const averageRating = sellerRatings.length
    ? sellerRatings.reduce((sum, rating) => sum + rating.score, 0) /
      sellerRatings.length
    : 0;

  return (
    <main className="page-shell detail-shell">
      <JsonLd data={buildSellerJsonLd(seller, sellerRatings.length, averageRating)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: seller.name, path: `/seller/${seller.id}` },
        ])}
      />
      <Link href="/" className="back-link">
        Back to feed
      </Link>
      <section className="seller-hero" aria-labelledby="seller-heading">
        <div>
          <p className="eyebrow">Seller profile</p>
          <h1 id="seller-heading">{seller.name}</h1>
          <p className="hero-copy">{seller.bio}</p>
        </div>
        <div className="seller-summary">
          <p>{seller.location}</p>
          <RatingStars
            rating={averageRating}
            label={`${averageRating.toFixed(1)} average seller rating`}
          />
          <p className="muted-text">{sellerRatings.length} ratings</p>
        </div>
      </section>
      <section className="grid-gap">
        <div className="section-header-row">
          <h2>Products from {seller.name}</h2>
          <Link href="/post-product" className="secondary-button">
            Post a product
          </Link>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFocused={false}
              isScrolling={true}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
