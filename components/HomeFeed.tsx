"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ProductWithSeller } from "@/lib/types";
import ProductCard from "./ProductCard";

interface HomeFeedProps {
  products: ProductWithSeller[];
}

export default function HomeFeed({ products }: HomeFeedProps) {
  const [query, setQuery] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [status, setStatus] = useState("Use auto-detect to show nearby deals.");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detected, setDetected] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [focusedProductId, setFocusedProductId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleRatioRef = useRef<Map<string, number>>(new Map());
  const cardElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by this browser.");
      return;
    }

    setIsDetecting(true);
    setStatus("Finding your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDetected(true);
        setManualLocation("");
        setStatus(
          `Location detected. Showing deals near you (${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}).`,
        );
        setIsDetecting(false);
      },
      (error) => {
        setStatus(`Unable to detect location: ${error.message}`);
        setIsDetecting(false);
        setDetected(false);
      },
      { timeout: 12000 },
    );
  };

  const clearLocation = () => {
    setManualLocation("");
    setDetected(false);
    setStatus("Location cleared. Search any city or tap auto-detect again.");
  };

  const scrollTimeoutRef = useRef<number | null>(null);

  const handleScroll = () => {
    setHasScrolled(true);
    setScrolling(true);
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      setScrolling(false);
    }, 250);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const updateFocusedProduct = useCallback(() => {
    const visibleItems = Array.from(visibleRatioRef.current.entries()).filter(
      ([, ratio]) => ratio >= 0.45,
    );
    if (!visibleItems.length) {
      setFocusedProductId(null);
      return;
    }

    const [bestId] = visibleItems.reduce((best, current) =>
      current[1] > best[1] ? current : best,
    );
    setFocusedProductId(bestId[0]);
  }, []);

  const observer = useMemo(() => {
    if (typeof window === "undefined") return null;

    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const productId = entry.target.getAttribute("data-product-id");
          if (!productId) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            visibleRatioRef.current.set(productId, entry.intersectionRatio);
          } else {
            visibleRatioRef.current.delete(productId);
          }
        });

        updateFocusedProduct();
      },
      { threshold: [0.25, 0.45, 0.6] },
    );
  }, []);

  if (observerRef.current === null && observer) {
    observerRef.current = observer;
  }

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [observer]);

  const registerCard = useCallback(
    (productId: string) => (node: HTMLElement | null) => {
      const observer = observerRef.current;
      if (!observer) return;

      if (node) {
        cardElementsRef.current.set(productId, node);
        observer.observe(node);
      } else {
        const previousNode = cardElementsRef.current.get(productId);
        if (previousNode) {
          observer.unobserve(previousNode);
          cardElementsRef.current.delete(productId);
        }
        visibleRatioRef.current.delete(productId);
        updateFocusedProduct();
      }
    },
    [],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedLocation = detected
      ? ""
      : manualLocation.trim().toLowerCase();

    return products.filter((product) => {
      const text =
        `${product.title} ${product.description} ${product.category} ${product.sellerName}`.toLowerCase();
      const matchesQuery = normalizedQuery
        ? text.includes(normalizedQuery)
        : true;
      const matchesLocation = detected
        ? true
        : normalizedLocation
          ? product.location.toLowerCase().includes(normalizedLocation)
          : true;
      return matchesQuery && matchesLocation;
    });
  }, [products, query, manualLocation, detected]);

  return (
    <section className="grid-gap">
      <div className="search-panel">
        <div className="search-fields">
          <label className="field-label">
            Search products
            <input
              type="search"
              placeholder="Search for phone, sofa, laptop, bike"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search products"
            />
          </label>
          <label className="field-label">
            {detected ? "Using detected location" : "Location"}
            <input
              type="search"
              placeholder={
                detected ? "Location detected" : "Enter neighbourhood or city"
              }
              value={detected ? "Nearby" : manualLocation}
              onChange={(event) => {
                setManualLocation(event.target.value);
                setDetected(false);
              }}
              aria-label="Search location"
              disabled={detected}
            />
          </label>
        </div>
        <div className="search-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={detected ? clearLocation : handleDetectLocation}
            disabled={isDetecting}
          >
            {isDetecting
              ? "Detecting..."
              : detected
                ? "Clear location"
                : "Auto-detect location"}
          </button>
          <span className="status-text">{status}</span>
        </div>
      </div>

      <div className="section-header-row">
        <div>
          <p className="eyebrow">Featured nearby</p>
          <h2>Products you can grab today.</h2>
          {detected ? (
            <div className="location-banner">
              <span className="location-pill">Detected nearby</span>
              <p>Showing locally relevant deals in your area.</p>
            </div>
          ) : null}
        </div>
        <div>
          <Link className="secondary-button" href="/post-product">
            Post an item
          </Link>
          <Link
            className="secondary-button"
            href="/create-seller"
            style={{ marginLeft: "10px" }}
          >
            Become a seller
          </Link>
        </div>
      </div>
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cardRef={registerCard(product.id)}
            isFocused={focusedProductId === product.id}
            isScrolling={scrolling}
            hasScrolled={hasScrolled}
          />
        ))}
      </div>
      {!filteredProducts.length ? (
        <div className="info-card">
          <h3>No products matched</h3>
          <p>
            Try a broader search term or clear the location filter to browse
            more deals.
          </p>
        </div>
      ) : null}
    </section>
  );
}
