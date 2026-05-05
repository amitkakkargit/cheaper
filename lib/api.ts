import type { ApiReview, Product, ProductWithSeller, Rating, Seller } from "@/lib/types";
import { getConfiguredApiBaseUrl } from "@/lib/apiBaseUrl";

const delay = () => new Promise((resolve) => setTimeout(resolve, 25));

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getConfiguredApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

const computeAverage = (ratings: Array<{ rating: number }>) =>
  ratings.length ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length : 0;

const productImageThemes = [
  { background: "#1d4ed8", accent: "#f8fafc" },
  { background: "#0f766e", accent: "#ecfeff" },
  { background: "#be123c", accent: "#fff1f2" },
];

const escapeSvgText = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getProductArtwork = (product: Product, index: number) => {
  const title = product.title.toLowerCase();
  const category = product.category.toLowerCase();
  const shadow = '<ellipse cx="450" cy="558" rx="230" ry="34" fill="rgba(15,23,42,0.18)"/>';

  if (title.includes("bike") || category.includes("vehicle")) {
    return `${shadow}<circle cx="310" cy="480" r="86" fill="#111827"/><circle cx="590" cy="480" r="86" fill="#111827"/><path d="M310 480 L405 350 L490 480 L360 480 L470 350 L590 480" fill="none" stroke="#f97316" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  if (title.includes("phone")) {
    return `${shadow}<rect x="326" y="150" width="248" height="420" rx="42" fill="#111827"/><rect x="350" y="194" width="200" height="314" rx="22" fill="#38bdf8"/>`;
  }

  if (title.includes("laptop")) {
    return `${shadow}<rect x="248" y="206" width="404" height="276" rx="24" fill="#111827"/><rect x="274" y="232" width="352" height="216" rx="12" fill="#60a5fa"/><path d="M198 504 H702 L654 568 H246 Z" fill="#334155"/>`;
  }

  return `${shadow}<rect x="266" y="206" width="368" height="316" rx="44" fill="#f8fafc"/><circle cx="382" cy="364" r="58" fill="#38bdf8"/><rect x="472" y="326" width="110" height="76" rx="22" fill="#f97316"/>`;
};

const buildProductImageSvg = (product: Product, index: number) => {
  const theme = productImageThemes[index % productImageThemes.length];
  const title = escapeSvgText(product.title.replace(/\s+for sale.+$/i, "").trim());
  const subtitle = escapeSvgText(`${product.category} in ${product.location.split(",")[0]}`);

  return `
    <svg width="900" height="700" viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${theme.background}"/>
          <stop offset="1" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="900" height="700" fill="url(#bg)"/>
      <circle cx="760" cy="94" r="170" fill="rgba(255,255,255,0.15)"/>
      <circle cx="110" cy="626" r="190" fill="rgba(255,255,255,0.12)"/>
      <rect x="70" y="78" width="760" height="544" rx="48" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.26)" stroke-width="2"/>
      ${getProductArtwork(product, index)}
      <text x="86" y="636" fill="${theme.accent}" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800">${title}</text>
      <text x="86" y="674" fill="${theme.accent}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600">${subtitle}</text>
    </svg>
  `;
};

const buildProductImages = (product: Product) => {
  const isAllowedImage = (url: string) => Boolean(url) && !url.includes("fakeimg.pl");
  const providedImages = Array.isArray(product.images)
    ? product.images.filter(isAllowedImage)
    : [];
  const generatedImages = [0, 1, 2].map(
    (index) => `/api/product-image/${encodeURIComponent(product.id)}/${index}`,
  );

  return Array.from(
    new Set([...generatedImages, ...providedImages, product.imageUrl].filter(isAllowedImage)),
  ).slice(0, 6);
};

function toRating(review: ApiReview): Rating {
  return {
    id: review.id,
    targetId: review.productId ?? review.sellerId ?? "",
    score: review.rating,
    review: review.comment ?? "",
  };
}

function enrichProduct(product: Product & { seller?: Seller; reviews?: ApiReview[] }): ProductWithSeller {
  const productReviews = product.reviews ?? [];
  const sellerReviews = product.seller?.reviews ?? [];

  return {
    ...product,
    images: buildProductImages(product),
    sellerName: product.seller?.name || "Local seller",
    sellerLocation: product.seller?.location || product.location,
    sellerAvatarUrl: product.seller?.avatarUrl || "",
    productRatingCount: productReviews.length,
    productRatingAverage: parseFloat(computeAverage(productReviews).toFixed(1)),
    sellerRatingCount: sellerReviews.length,
    sellerRatingAverage: parseFloat(computeAverage(sellerReviews).toFixed(1)),
  };
}

export async function getGeneratedProductImageSvg(productId: string, imageIndex: number) {
  const product = await getProductById(productId);
  if (!product || imageIndex < 0 || imageIndex > 2) {
    return null;
  }

  return buildProductImageSvg(product, imageIndex);
}

export async function getAllProducts(): Promise<ProductWithSeller[]> {
  await delay();
  const products = await apiFetch<Array<Product & { seller?: Seller; reviews?: ApiReview[] }>>("/products");
  return products.map(enrichProduct);
}

export async function getProductById(id: string): Promise<ProductWithSeller | null> {
  await delay();
  try {
    const product = await apiFetch<Product & { seller?: Seller; reviews?: ApiReview[] }>(`/products/${encodeURIComponent(id)}`);
    return enrichProduct(product);
  } catch {
    return null;
  }
}

export async function getSellerById(id: string): Promise<Seller | null> {
  await delay();
  try {
    return await apiFetch<Seller>(`/sellers/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

export async function getProductsBySeller(sellerId: string): Promise<ProductWithSeller[]> {
  await delay();
  const products = await apiFetch<Array<Product & { seller?: Seller; reviews?: ApiReview[] }>>(
    `/products?sellerId=${encodeURIComponent(sellerId)}`,
  );
  return products.map(enrichProduct);
}

export async function getSellerRatings(sellerId: string): Promise<Rating[]> {
  await delay();
  const reviews = await apiFetch<ApiReview[]>(`/seller-reviews/${encodeURIComponent(sellerId)}`);
  return reviews.map(toRating);
}

export async function getAllProductRatings(productId: string): Promise<Rating[]> {
  await delay();
  const reviews = await apiFetch<ApiReview[]>(`/product-reviews/${encodeURIComponent(productId)}`);
  return reviews.map(toRating);
}

export async function searchProducts(query: string, location: string): Promise<ProductWithSeller[]> {
  await delay();
  const params = new URLSearchParams();
  if (query.trim()) params.set("search", query.trim());
  if (location.trim()) params.set("location", location.trim());
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const products = await apiFetch<Array<Product & { seller?: Seller; reviews?: ApiReview[] }>>(`/products${suffix}`);
  return products.map(enrichProduct);
}
