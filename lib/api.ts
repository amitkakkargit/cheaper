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

const enrichProduct = (product: Product): ProductWithSeller => {
  const seller = sellersData.find((item) => item.id === product.sellerId);
  const productRatingsForProduct = productRatings.filter((rating) => rating.targetId === product.id);
  const sellerRatingsForSeller = sellerRatings.filter((rating) => rating.targetId === product.sellerId);

  return {
    ...product,
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
