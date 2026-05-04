"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ProductWithSeller } from "@/lib/types";
import ImageCarousel from "./ImageCarousel";
import RatingStars from "./RatingStars";

interface ProductCardProps {
  product: ProductWithSeller;
  isFocused: boolean;
  isScrolling: boolean;
  cardRef?: (node: HTMLElement | null) => void;
}

function ProductCard({
  product,
  isFocused,
  isScrolling,
  cardRef,
}: ProductCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackTimerRef = useRef<number | null>(null);

  const images = useMemo(
    () =>
      product.images && product.images.length
        ? product.images
        : [product.imageUrl].filter(Boolean),
    [product.imageUrl, product.images],
  );

  useEffect(() => {
    if (isFocused && !isScrolling && product.videoUrl && videoRef.current) {
      const video = videoRef.current;
      video.currentTime = 0;
      video.muted = true;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));

      if (playbackTimerRef.current) {
        window.clearTimeout(playbackTimerRef.current);
      }
      playbackTimerRef.current = window.setTimeout(() => {
        video.pause();
        setIsPlaying(false);
      }, 5000);
    }

    if ((!isFocused || isScrolling) && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (playbackTimerRef.current) {
        window.clearTimeout(playbackTimerRef.current);
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        window.clearTimeout(playbackTimerRef.current);
      }
    };
  }, [isFocused, isScrolling, product.videoUrl]);

  if (!isVisible || !images.length) {
    return null;
  }

  return (
    <article
      className="product-card"
      ref={cardRef ?? null}
      data-product-id={product.id}
    >
      <div className="product-image-wrap">
        <ImageCarousel
          images={images}
          alt={product.title}
          onAllImagesFailed={() => setIsVisible(false)}
        />
        {product.videoUrl ? (
          <>
            <video
              ref={videoRef}
              className={`product-video ${isPlaying ? "visible" : ""}`}
              src={product.videoUrl}
              playsInline
              muted
              loop
              preload="metadata"
              poster={images[0]}
            />
            <div
              className={`video-preview-indicator ${isPlaying ? "visible" : ""}`}
            >
              Preview active
            </div>
          </>
        ) : null}
        <span className="discount-pill product-badge">
          {product.discountPercentage}% off
        </span>
      </div>

      <div className="product-card-content">
        <div className="meta-row">
          <span className="product-tag">{product.condition}</span>
          <span>{product.category}</span>
        </div>
        <h2>{product.title}</h2>
        <p className="muted-text">
          {product.location} - {product.sellerName}
        </p>
        <div className="product-rating-row">
          <RatingStars
            rating={
              product.productRatingCount > 0
                ? product.productRatingAverage
                : 4.0
            }
            label={
              product.productRatingCount > 0
                ? `${product.productRatingAverage.toFixed(1)} out of 5`
                : "No reviews yet"
            }
          />
          <span className="rating-count">
            {product.productRatingCount > 0
              ? `${product.productRatingCount} reviews`
              : "No reviews yet"}
          </span>
        </div>
        <p className="seller-subtext">
          {product.sellerRatingCount > 0
            ? `${product.sellerRatingAverage.toFixed(1)} seller rating - ${product.sellerRatingCount} ratings`
            : "Seller rating unavailable"}
        </p>
        <div className="price-row">
          <span className="price-large">Rs. {product.currentPrice}</span>
          <span className="original-price">Rs. {product.previousPrice}</span>
        </div>
        <Link
          href={`/product/${encodeURIComponent(product.id)}`}
          className="product-link"
        >
          View product details
        </Link>
      </div>
    </article>
  );
}

export default memo(ProductCard);
