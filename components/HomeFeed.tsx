"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ProductWithSeller } from "@/lib/types";
import ProductCard from "./ProductCard";

interface HomeFeedProps {
  products: ProductWithSeller[];
}

const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function HomeFeed({ products }: HomeFeedProps) {
  const [query, setQuery] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [status, setStatus] = useState("Use auto-detect to show nearby deals.");
  const [locationStatus, setLocationStatus] = useState(
    "Search by city, district, or postal code in India.",
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [detected, setDetected] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationCoords, setLocationCoords] = useState<
    { lat: number; lng: number } | null
  >(null);
  const [scrolling, setScrolling] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
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
    setLocationStatus("Detecting your coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setDetected(true);
        setManualLocation("");
        setUserLat(lat);
        setUserLng(lng);
        setLocationCoords({ lat, lng });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
          );
          const data = await response.json();
          const displayName = data?.display_name || "your area";
          setStatus(
            `Location detected near ${displayName}. Showing deals nearby.`,
          );
          setLocationStatus(
            `Detected location: ${displayName}. Filtering products within 70 km.`,
          );
        } catch {
          setStatus(
            `Location detected. Showing deals near ${lat.toFixed(2)}, ${lng.toFixed(2)}.`,
          );
          setLocationStatus(
            "Detected coordinates. Filtering local products.",
          );
        }

        setIsDetecting(false);
      },
      (error) => {
        setStatus(`Unable to detect location: ${error.message}`);
        setLocationStatus("Unable to detect your location. Please search manually.");
        setIsDetecting(false);
        setDetected(false);
        setLocationCoords(null);
      },
      { timeout: 12000 },
    );
  };

  const clearLocation = () => {
    setManualLocation("");
    setDetected(false);
    setUserLat(null);
    setUserLng(null);
    setLocationCoords(null);
    setStatus("Location cleared. Search any city or tap auto-detect again.");
    setLocationStatus("Search by city, district, or postal code in India.");
  };

  useEffect(() => {
    if (!manualLocation.trim()) {
      setLocationCoords(null);
      setLocationStatus("Search by city, district, or postal code in India.");
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setLocationStatus(`Searching locations for “${manualLocation}”...`);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?countrycodes=in&format=json&limit=6&q=${encodeURIComponent(
            manualLocation,
          )}`,
          { signal: controller.signal },
        );
        const results = await response.json();

        if (Array.isArray(results) && results.length > 0) {
          const first = results[0];
          const lat = Number(first.lat);
          const lon = Number(first.lon);
          if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
            setLocationCoords({ lat, lng: lon });
            setLocationStatus(
              `Resolved ${first.display_name}. Filtering products nearby.`,
            );
            return;
          }
        }

        setLocationCoords(null);
        setLocationStatus(
          `Unable to resolve “${manualLocation}”. Showing matches by city or district name.`,
        );
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          setLocationCoords(null);
          setLocationStatus(
            `Unable to resolve location. Try a known city or pincode in India.`,
          );
        }
      }
    }, 550);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [manualLocation]);

  const scrollTimeoutRef = useRef<number | null>(null);

  const handleScroll = () => {
    setHasScrolled(true);
    setScrolling(true);
    setShowBackToTop(window.scrollY > 240);

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      setScrolling(false);
    }, 180);
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

    const locationSource = detected && userLat !== null && userLng !== null
      ? { lat: userLat, lng: userLng }
      : locationCoords;

    return products.filter((product) => {
      const text =
        `${product.title} ${product.description} ${product.category} ${product.sellerName} ${product.location}`.toLowerCase();
      const matchesQuery = normalizedQuery
        ? text.includes(normalizedQuery)
        : true;

      const matchesLocation = locationSource
        ? calculateDistance(
            locationSource.lat,
            locationSource.lng,
            product.latitude,
            product.longitude,
          ) < 70
        : manualLocation.trim()
          ? product.location
            .toLowerCase()
            .includes(manualLocation.trim().toLowerCase())
          : true;

      return matchesQuery && matchesLocation;
    });
  }, [products, query, manualLocation, detected, userLat, userLng, locationCoords]);

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
          <div className="status-column">
            <span className="status-text">{status}</span>
            <span className="location-status">{locationStatus}</span>
          </div>
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
      <button
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          fontSize: "20px",
          cursor: "pointer",
          display: showBackToTop ? "block" : "none",
        }}
        aria-label="Back to top"
      >
        ↑
      </button>
    </section>
  );
}
