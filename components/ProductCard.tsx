"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ProductWithSeller } from "@/lib/types";
import RatingStars from "./RatingStars";
import ImageCarousel from "./ImageCarousel";

interface ProductCardProps {
  product: ProductWithSeller;
  isFocused: boolean;
  isScrolling: boolean;
  hasScrolled: boolean;
  cardRef: (node: HTMLElement | null) => void;
}

function ProductCard({
  product,
  isFocused,
  isScrolling,
  hasScrolled,
  cardRef,
}: ProductCardProps) {
  const [allImagesFailed, setAllImagesFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      isFocused &&
      hasScrolled &&
      !isScrolling &&
      product.videoUrl &&
      videoRef.current
    ) {
      const video = videoRef.current;
      video.currentTime = 0;
      video.muted = true;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });

      if (playbackTimerRef.current) {
        window.clearTimeout(playbackTimerRef.current);
      }
      playbackTimerRef.current = window.setTimeout(() => {
        video.pause();
        setIsPlaying(false);
      }, 5000);
    }

    if ((!isFocused || isScrolling || !hasScrolled) && videoRef.current) {
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
  }, [isFocused, isScrolling, hasScrolled, product.videoUrl]);

  if (allImagesFailed) {
    return null;
  }

  return (
    <article
      className="product-card"
      ref={cardRef}
      data-product-id={product.id}
    >
      <div className="product-image-wrap">
        <ImageCarousel
          images={product.imageUrls}
          alt={product.title}
          onAllImagesFailed={() => setAllImagesFailed(true)}
          className="product-image"
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
              poster={product.imageUrls[0]}
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
          {product.location} · {product.sellerName}
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
            ? `${product.sellerRatingAverage.toFixed(1)} seller rating · ${product.sellerRatingCount} ratings`
            : "Seller rating unavailable"}
        </p>
        <div className="price-row">
          <span className="price-large">₹{product.currentPrice}</span>
          <span className="original-price">₹{product.previousPrice}</span>
        </div>
        <Link href={`/product/${product.id}`} className="product-link">
          View product details
        </Link>
      </div>
    </article>
  );
}

export default memo(ProductCard);
