import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllProductRatings,
  getProductById,
  getSellerById,
} from "@/lib/api";
import ImageCarousel from "@/components/ImageCarousel";
import RatingStars from "@/components/RatingStars";
import SellerBadge from "@/components/SellerBadge";
import ProductActions from "@/components/ProductActions";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return notFound();
  }

  const seller = await getSellerById(product.sellerId);
  const productRatings = await getAllProductRatings(product.id);
  const averageRating = productRatings.length
    ? productRatings.reduce((sum, rating) => sum + rating.score, 0) /
      productRatings.length
    : 0;

  return (
    <main className="page-shell detail-shell">
      <Link href="/" className="back-link">
        Back to feed
      </Link>
      <section className="detail-grid">
        <div className="detail-image-card">
          <ImageCarousel
            images={
              product.images && product.images.length
                ? product.images
                : [product.imageUrl]
            }
            alt={product.title}
            className="detail-carousel"
          />
          <div className="price-badge">{product.discountPercentage}% OFF</div>
        </div>
        <div className="detail-copy">
          <span className="tag-label">{product.condition}</span>
          <h1>{product.title}</h1>
          <div className="detail-meta">
            <div>
              <p className="meta-label">Price</p>
              <p className="price-large">Rs. {product.currentPrice}</p>
              <p className="muted-text">Was Rs. {product.previousPrice}</p>
            </div>
            <div>
              <p className="meta-label">Product rating</p>
              <RatingStars
                rating={averageRating}
                label={`${averageRating.toFixed(1)} out of 5`}
              />
              <p className="muted-text">{productRatings.length} reviews</p>
            </div>
          </div>
          <p className="detail-description">{product.description}</p>
          {seller ? <SellerBadge seller={seller} /> : null}
        </div>
      </section>
      <section className="detail-actions">
        <ProductActions product={product} />
        <div className="info-card">
          <h2>Why this deal matters</h2>
          <p>
            Cheaper Marketplace is built for nearby shoppers who want quality
            products at the lowest available price. Find useful items fast and
            message sellers with confidence.
          </p>
        </div>
        <div className="info-card">
          <h2>Seller notes</h2>
          <p>{seller?.bio || "Trusted local seller with quick replies."}</p>
        </div>
      </section>
    </main>
  );
}
