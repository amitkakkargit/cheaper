"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  onAllImagesFailed?: () => void;
  className?: string;
}

export default function ImageCarousel({
  images,
  alt,
  onAllImagesFailed,
  className,
}: ImageCarouselProps) {
  const normalizedImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean).slice(0, 6) : []),
    [images],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const visibleImages = normalizedImages.filter(
    (image) => !failedImages.has(image),
  );

  useEffect(() => {
    setCurrentIndex(0);
    setFailedImages(new Set());
  }, [normalizedImages.join("|")]);

  useEffect(() => {
    if (!visibleImages.length) {
      onAllImagesFailed?.();
    }
  }, [visibleImages.length, onAllImagesFailed]);

  const goToImage = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, visibleImages.length - 1));
    setCurrentIndex(safeIndex);
    carouselRef.current?.scrollTo({
      left: safeIndex * carouselRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  if (!visibleImages.length) {
    return null;
  }

  return (
    <div className={`image-carousel ${className ?? ""}`}>
      <div
        className="image-carousel-track"
        ref={carouselRef}
        onScroll={(event) => {
          const width = event.currentTarget.clientWidth || 1;
          setCurrentIndex(Math.round(event.currentTarget.scrollLeft / width));
        }}
      >
        {visibleImages.map((image, index) => (
          <img
            key={image}
            className="product-image"
            src={image}
            alt={`${alt} image ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            onError={() => {
              setFailedImages((previous) => new Set(previous).add(image));
              setCurrentIndex(0);
            }}
          />
        ))}
      </div>

      {visibleImages.length > 1 ? (
        <div className="carousel-dots">
          {visibleImages.map((image, index) => (
            <button
              key={image}
              type="button"
              className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
              aria-label={`Show image ${index + 1}`}
              onClick={() => goToImage(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
