"use client";

import { useEffect, useMemo, useState } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  onAllImagesFailed?: () => void;
  className?: string;
}

const genericFallbackImage =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22900%22%20height%3D%22700%22%20viewBox%3D%220%200%20900%20700%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22900%22%20height%3D%22700%22%20fill%3D%22%23f8fbff%22/%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23475b69%22%20font-family%3D%22Inter,%20system-ui,%20sans-serif%22%20font-size%3D%2240%22%3EImage%20unavailable%3C/text%3E%3C/svg%3E";

function getFallbackImages(alt: string) {
  const label = encodeURIComponent(
    alt
      .split(" ")
      .slice(0, 2)
      .join(" "),
  );

  return [
    `https://fakeimg.pl/900x700/3e8ff/f2937?text=${label}&font=roboto`,
    `https://fakeimg.pl/900x700/1fae5/f2937?text=${label}&font=roboto`,
    `https://fakeimg.pl/900x700/ffafe/f2937?text=${label}&font=roboto`,
  ];
}

export default function ImageCarousel({
  images,
  alt,
  onAllImagesFailed,
  className,
}: ImageCarouselProps) {
  const normalizedImages = useMemo(() => {
    const validImages = Array.isArray(images) ? images.filter(Boolean) : [];
    if (validImages.length >= 3) {
      return validImages;
    }

    return Array.from(new Set([...validImages, ...getFallbackImages(alt)])).slice(0, 3);
  }, [images, alt]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImageIndexes, setFailedImageIndexes] = useState<Set<number>>(new Set());
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setFailedImageIndexes(new Set());
    setAllFailed(false);
  }, [normalizedImages.join("|")]);

  const handleImageError = () => {
    setFailedImageIndexes((previous) => {
      const next = new Set(previous);
      next.add(currentIndex);
      const remainingIndex = normalizedImages.findIndex((_, idx) => !next.has(idx));
      if (remainingIndex === -1) {
        setAllFailed(true);
        onAllImagesFailed?.();
        return next;
      }

      setCurrentIndex(remainingIndex);
      return next;
    });
  };

  const currentImage = normalizedImages[currentIndex] || genericFallbackImage;

  if (allFailed) {
    return null;
  }

  return (
    <div className={`image-carousel ${className ?? ""}`}>
      <img
        className="product-image"
        src={currentImage}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={handleImageError}
      />
      <button
        type="button"
        className="carousel-button carousel-prev"
        aria-label="Previous image"
        onClick={() => {
          const prevIndex =
            currentIndex === 0 ? normalizedImages.length - 1 : currentIndex - 1;
          setCurrentIndex(prevIndex);
        }}
      >
        ‹
      </button>
      <button
        type="button"
        className="carousel-button carousel-next"
        aria-label="Next image"
        onClick={() => {
          const nextIndex =
            currentIndex === normalizedImages.length - 1 ? 0 : currentIndex + 1;
          setCurrentIndex(nextIndex);
        }}
      >
        ›
      </button>
      <div className="carousel-dots">
        {normalizedImages.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
            aria-label={`Show image ${index + 1}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
