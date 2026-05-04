"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProductWithSeller } from "@/lib/types";
import ProductCard from "./ProductCard";

interface HomeFeedProps {
  products: ProductWithSeller[];
}

export default function HomeFeed({ products }: HomeFeedProps) {
  const [query, setQuery] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [status, setStatus] = useState("Search products or choose an India location.");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detected, setDetected] = useState(false);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
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
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10&addressdetails=1`,
          );
          const data = await response.json();
          if (data.address?.country_code !== "in") {
            setStatus("Auto-detected location is outside India. Search an India city instead.");
            setDetected(false);
            return;
          }

          const locationName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.state ||
            data.address.county ||
            data.address.country;

          if (locationName) {
            const stateName = data.address.state;
            setManualLocation(
              stateName && stateName !== locationName
                ? `${locationName}, ${stateName}`
                : locationName,
            );
            setDetected(true);
            setStatus(
              `Location detected: ${locationName}. Showing nearby deals.`,
            );
          } else {
            setStatus(
              "Location detected, but unable to determine readable city name.",
            );
            setDetected(false);
          }
        } catch (error) {
          setStatus("Unable to reverse geocode location.");
          setDetected(false);
        } finally {
          setIsDetecting(false);
        }
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
    setLocationOptions([]);
    setStatus("Location cleared. Search any city or tap auto-detect again.");
  };

  const scrollTimeoutRef = useRef<number | null>(null);

  const handleScroll = () => {
    setScrolling(true);
    setShowBackToTop(window.scrollY > 320);
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      setScrolling(false);
      updateFocusedProduct();
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
  const fetchLocationSuggestions = useCallback(
    async (locationQuery: string) => {
      if (!locationQuery.trim()) {
        setLocationOptions([]);
        return;
      }

      setLocationLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(
            locationQuery,
          )}&addressdetails=1&limit=5`,
        );
        const data = await response.json();
        const options = (data || [])
          .map((item: any) => {
            const city =
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              item.address?.state_district ||
              item.address?.state;
            return city
              ? `${city}, ${item.address?.state || item.address?.country}`
              : null;
          })
          .filter(Boolean)
          .filter(
            (value: string, index: number, self: string[]) =>
              self.indexOf(value) === index,
          )
          .slice(0, 5) as string[];
        setLocationOptions(options);
      } catch {
        setLocationOptions([]);
      } finally {
        setLocationLoading(false);
      }
    },
    [],
  );
  useEffect(() => {
    if (!detected && manualLocation.trim().length > 2) {
      const debounce = window.setTimeout(() => {
        fetchLocationSuggestions(manualLocation);
      }, 350);
      return () => window.clearTimeout(debounce);
    }

    setLocationOptions([]);
  }, [manualLocation, detected, fetchLocationSuggestions]);

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
    setFocusedProductId(bestId);
  }, []);

  const observer = useMemo(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return null;
    }

    return new window.IntersectionObserver(
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
    const normalizedLocation = manualLocation.trim().toLowerCase();

    return products.filter((product) => {
      const text =
        `${product.title} ${product.description} ${product.category} ${product.sellerName}`.toLowerCase();
      const matchesQuery = normalizedQuery
        ? text.includes(normalizedQuery)
        : true;
      const matchesLocation = normalizedLocation
        ? product.location.toLowerCase().includes(normalizedLocation)
        : true;
      return matchesQuery && matchesLocation;
    });
  }, [products, query, manualLocation]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, 80),
    [filteredProducts],
  );

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
              placeholder="Enter neighbourhood or city"
              value={manualLocation}
              onChange={(event) => {
                setManualLocation(event.target.value);
                setDetected(false);
              }}
              aria-label="Search location"
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
        {(query || manualLocation) ? (
          <div className="active-filter-row">
            <span>
              Showing {filteredProducts.length} result
              {filteredProducts.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setQuery("");
                clearLocation();
              }}
            >
              Clear search
            </button>
          </div>
        ) : null}
        {!detected && locationOptions.length > 0 ? (
          <div className="location-options">
            {locationLoading ? (
              <p>Loading location suggestions...</p>
            ) : (
              locationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="location-suggestion"
                  onClick={() => {
                    setManualLocation(option);
                    setLocationOptions([]);
                  }}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        ) : null}
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
          <a className="secondary-button" href="/post-product">
            Post an item
          </a>
          <a
            className="secondary-button"
            href="/create-seller"
            style={{ marginLeft: "10px" }}
          >
            Become a seller
          </a>
        </div>
      </div>
      <div className="product-grid">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cardRef={registerCard(product.id)}
            isFocused={focusedProductId === product.id}
            isScrolling={scrolling}
          />
        ))}
      </div>
      {filteredProducts.length > displayedProducts.length ? (
        <div className="info-card">
          <p>
            {filteredProducts.length} products match your search. Keep scrolling
            for more.
          </p>
        </div>
      ) : null}
      {!filteredProducts.length ? (
        <div className="info-card">
          <h3>No products matched</h3>
          <p>
            Try a broader search term or clear the location filter to browse
            more deals.
          </p>
        </div>
      ) : null}
      {showBackToTop ? (
        <button
          type="button"
          className="back-to-top-button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to top
        </button>
      ) : null}
    </section>
  );
}
