import Link from "next/link";
import {
  getSellerById,
  getProductsBySeller,
  getSellerRatings,
} from "@/lib/api";
import RatingStars from "@/components/RatingStars";
import ProductCard from "@/components/ProductCard";

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

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
      <Link href="/" className="back-link">
        Back to feed
      </Link>
      <section className="seller-hero">
        <div>
          <p className="eyebrow">Seller profile</p>
          <h1>{seller.name}</h1>
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
