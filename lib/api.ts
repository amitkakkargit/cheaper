import products from '@/data/products.json';
import sellers from '@/data/sellers.json';
import productRatings from '@/data/productRatings.json';
import sellerRatings from '@/data/sellerRatings.json';
import type { Product, ProductWithSeller, Seller, Rating } from '@/lib/types';

const productsData = products as Product[];
const sellersData = sellers as Seller[];
const delay = () => new Promise((resolve) => setTimeout(resolve, 25));

const computeAverage = (ratings: Rating[]) =>
  ratings.length ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length : 0;

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
  const variant = index % 3;
  const shadow = '<ellipse cx="450" cy="558" rx="230" ry="34" fill="rgba(15,23,42,0.18)"/>';

  if (title.includes("bike") || title.includes("cycle") || category.includes("vehicle")) {
    return `
      ${shadow}
      <g transform="translate(${variant === 1 ? 16 : variant === 2 ? -14 : 0} 0)">
        <circle cx="310" cy="480" r="86" fill="#111827"/>
        <circle cx="590" cy="480" r="86" fill="#111827"/>
        <circle cx="310" cy="480" r="52" fill="#e0f2fe"/>
        <circle cx="590" cy="480" r="52" fill="#e0f2fe"/>
        <path d="M310 480 L405 350 L490 480 L360 480 L470 350 L590 480" fill="none" stroke="#f97316" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M470 350 L540 330 M405 350 L370 306 M362 306 L428 306" fill="none" stroke="#0f172a" stroke-width="18" stroke-linecap="round"/>
        <rect x="504" y="306" width="86" height="18" rx="9" fill="#0f172a"/>
      </g>
    `;
  }

  if (title.includes("sofa")) {
    return `
      ${shadow}
      <rect x="216" y="310" width="468" height="194" rx="40" fill="#f59e0b"/>
      <rect x="170" y="384" width="124" height="154" rx="34" fill="#d97706"/>
      <rect x="606" y="384" width="124" height="154" rx="34" fill="#d97706"/>
      <rect x="244" y="286" width="180" height="124" rx="26" fill="#fbbf24"/>
      <rect x="476" y="286" width="180" height="124" rx="26" fill="#fbbf24"/>
      <rect x="230" y="506" width="440" height="38" rx="19" fill="#92400e"/>
      <rect x="254" y="538" width="38" height="64" rx="14" fill="#78350f"/>
      <rect x="608" y="538" width="38" height="64" rx="14" fill="#78350f"/>
    `;
  }

  if (title.includes("table") || title.includes("dining")) {
    return `
      ${shadow}
      <rect x="206" y="310" width="488" height="82" rx="22" fill="#a16207"/>
      <rect x="238" y="376" width="52" height="172" rx="18" fill="#78350f"/>
      <rect x="610" y="376" width="52" height="172" rx="18" fill="#78350f"/>
      <rect x="330" y="430" width="240" height="42" rx="18" fill="#854d0e"/>
      <circle cx="338" cy="276" r="38" fill="#fef3c7"/>
      <rect x="414" y="236" width="72" height="72" rx="16" fill="#dc2626"/>
      <rect x="520" y="254" width="84" height="48" rx="16" fill="#16a34a"/>
    `;
  }

  if (title.includes("phone") || title.includes("smartphone")) {
    return `
      ${shadow}
      <rect x="326" y="150" width="248" height="420" rx="42" fill="#111827"/>
      <rect x="350" y="194" width="200" height="314" rx="22" fill="#38bdf8"/>
      <circle cx="450" cy="534" r="16" fill="#e5e7eb"/>
      <rect x="400" y="168" width="100" height="12" rx="6" fill="#475569"/>
      <circle cx="408" cy="284" r="48" fill="#f8fafc"/>
      <rect x="380" y="366" width="140" height="20" rx="10" fill="#f8fafc"/>
      <rect x="392" y="402" width="116" height="16" rx="8" fill="#e0f2fe"/>
    `;
  }

  if (title.includes("laptop")) {
    return `
      ${shadow}
      <rect x="248" y="206" width="404" height="276" rx="24" fill="#111827"/>
      <rect x="274" y="232" width="352" height="216" rx="12" fill="#60a5fa"/>
      <path d="M198 504 H702 L654 568 H246 Z" fill="#334155"/>
      <rect x="390" y="524" width="120" height="14" rx="7" fill="#94a3b8"/>
      <circle cx="450" cy="340" r="58" fill="#dbeafe"/>
      <path d="M394 408 H506" stroke="#eff6ff" stroke-width="20" stroke-linecap="round"/>
    `;
  }

  if (title.includes("fryer") || title.includes("mixer") || title.includes("oven")) {
    return `
      ${shadow}
      <rect x="300" y="212" width="300" height="330" rx="58" fill="#f8fafc"/>
      <rect x="326" y="248" width="248" height="126" rx="30" fill="#0f172a"/>
      <rect x="350" y="406" width="200" height="86" rx="26" fill="#cbd5e1"/>
      <circle cx="450" cy="437" r="22" fill="#ef4444"/>
      <rect x="372" y="166" width="156" height="54" rx="24" fill="#e2e8f0"/>
      <path d="M346 536 H554" stroke="#94a3b8" stroke-width="18" stroke-linecap="round"/>
    `;
  }

  return `
    ${shadow}
    <rect x="266" y="206" width="368" height="316" rx="44" fill="#f8fafc"/>
    <path d="M266 304 H634" stroke="#cbd5e1" stroke-width="28"/>
    <circle cx="382" cy="364" r="58" fill="#38bdf8"/>
    <rect x="472" y="326" width="110" height="76" rx="22" fill="#f97316"/>
    <rect x="332" y="446" width="236" height="34" rx="17" fill="#0f172a"/>
    <rect x="372" y="522" width="156" height="28" rx="14" fill="#475569"/>
  `;
};

const buildInlineProductImage = (product: Product, index: number) => {
  const theme = productImageThemes[index % productImageThemes.length];
  const title = escapeSvgText(
    product.title.replace(/\s+for sale.+$/i, "").trim(),
  );
  const subtitle = escapeSvgText(
    `${product.category} in ${product.location.split(",")[0]}`,
  );
  const svg = `
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
      <rect x="82" y="88" width="214" height="50" rx="25" fill="rgba(255,255,255,0.92)"/>
      <text x="108" y="122" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="800">Image ${index + 1}</text>
      <text x="86" y="636" fill="${theme.accent}" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800">${title}</text>
      <text x="86" y="674" fill="${theme.accent}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const buildProductImages = (product: Product) => {
  const providedImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const generatedImages = [0, 1, 2].map((index) =>
    buildInlineProductImage(product, index),
  );

  return Array.from(
    new Set([...generatedImages, ...providedImages, product.imageUrl].filter(Boolean)),
  ).slice(0, 6);
};

const enrichProduct = (product: Product): ProductWithSeller => {
  const seller = sellersData.find((item) => item.id === product.sellerId);
  const productRatingsForProduct = productRatings.filter((rating) => rating.targetId === product.id);
  const sellerRatingsForSeller = sellerRatings.filter((rating) => rating.targetId === product.sellerId);

  return {
    ...product,
    images: buildProductImages(product),
    sellerName: seller?.name || 'Local seller',
    sellerLocation: seller?.location || product.location,
    sellerAvatarUrl: seller?.avatarUrl || '',
    productRatingCount: productRatingsForProduct.length,
    productRatingAverage: parseFloat(computeAverage(productRatingsForProduct).toFixed(1)),
    sellerRatingCount: sellerRatingsForSeller.length,
    sellerRatingAverage: parseFloat(computeAverage(sellerRatingsForSeller).toFixed(1)),
  };
};

export async function getAllProducts(): Promise<ProductWithSeller[]> {
  await delay();
  return productsData.map(enrichProduct);
}

export async function getProductById(id: string): Promise<ProductWithSeller | null> {
  await delay();
  const product = productsData.find((item) => item.id === id);
  return product ? enrichProduct(product) : null;
}

export async function getSellerById(id: string): Promise<Seller | null> {
  await delay();
  return sellersData.find((seller) => seller.id === id) ?? null;
}

export async function getProductsBySeller(sellerId: string): Promise<ProductWithSeller[]> {
  await delay();
  return productsData.filter((product) => product.sellerId === sellerId).map(enrichProduct);
}

export async function getSellerRatings(sellerId: string): Promise<Rating[]> {
  await delay();
  return sellerRatings.filter((rating) => rating.targetId === sellerId);
}

export async function getAllProductRatings(productId: string): Promise<Rating[]> {
  await delay();
  return productRatings.filter((rating) => rating.targetId === productId);
}

export async function searchProducts(query: string, location: string): Promise<ProductWithSeller[]> {
  await delay();
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLocation = location.trim().toLowerCase();

  return productsData
    .filter((product) => {
      const text = `${product.title} ${product.description} ${product.category} ${product.location}`.toLowerCase();
      const matchesQuery = normalizedQuery ? text.includes(normalizedQuery) : true;
      const matchesLocation = normalizedLocation ? product.location.toLowerCase().includes(normalizedLocation) : true;
      return matchesQuery && matchesLocation;
    })
    .map(enrichProduct);
}
