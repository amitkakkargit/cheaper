import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllProductRatings,
  getProductById,
  getSellerById,
} from "@/lib/api";
import JsonLd from "@/components/JsonLd";
import ImageCarousel from "@/components/ImageCarousel";
import RatingStars from "@/components/RatingStars";
import SellerBadge from "@/components/SellerBadge";
import ProductActions from "@/components/ProductActions";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildProductJsonLd,
} from "@/lib/seo";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return buildPageMetadata({
      title: "Product Not Found",
      description: "This Cheaper product listing could not be found.",
      path: `/product/${id}`,
      robotsIndex: false,
    });
  }

  const image = product.images?.[0] || product.imageUrl;
  return buildPageMetadata({
    title: `${product.title} in ${product.location}`,
    description: `${product.title} is listed for Rs. ${product.currentPrice} by ${product.sellerName}. Condition: ${product.condition}. ${product.description}`,
    path: `/product/${product.id}`,
    image,
  });
}

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
  const productImageAlt = `${product.title} for sale by ${product.sellerName} in ${product.location}. Condition: ${product.condition}.`;

  return (
    <main className="page-shell detail-shell">
      <JsonLd data={buildProductJsonLd(product, productRatings)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: product.title, path: `/product/${product.id}` },
        ])}
      />
      <Link href="/" className="back-link">
        Back to feed
      </Link>
      <section className="detail-grid" aria-labelledby="product-heading">
        <div className="detail-image-card">
          <ImageCarousel
            images={
              product.images && product.images.length
                ? product.images
                : [product.imageUrl]
            }
            alt={productImageAlt}
            className="detail-carousel"
          />
          <div className="price-badge">{product.discountPercentage}% OFF</div>
        </div>
        <div className="detail-copy">
          <span className="tag-label">{product.condition}</span>
          <h1 id="product-heading">{product.title}</h1>
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
            <div>
              <p className="meta-label">Location</p>
              <p>{product.location}</p>
              <p className="muted-text">{product.category}</p>
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
        <section className="info-card" aria-labelledby="product-faq-heading">
          <h2 id="product-faq-heading">Product questions</h2>
          <h3>How do I complete this purchase?</h3>
          <p>
            Meet the seller locally, inspect the product, and confirm the
            handoff only after you receive the item.
          </p>
          <h3>When can I review this product?</h3>
          <p>
            Reviews are available after the buyer confirms receipt and the
            seller confirms the sale.
          </p>
        </section>
      </section>
    </main>
  );
}
