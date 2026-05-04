import { getAllProducts, getProductById, getSellerById, searchProducts } from '@/lib/api';

describe('mock api service', () => {
  it('returns a full product list', async () => {
    const products = await getAllProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('sellerName');
  });

  it('finds a product by id', async () => {
    const products = await getAllProducts();
    const product = await getProductById(products[0].id);
    expect(product).not.toBeNull();
    expect(product?.id).toBe(products[0].id);
  });

  it('returns a seller by id', async () => {
    const products = await getAllProducts();
    const seller = await getSellerById(products[0].sellerId);
    expect(seller).not.toBeNull();
    expect(seller?.id).toBe(products[0].sellerId);
  });

  it('filters products by search text and location', async () => {
    const products = await getAllProducts();
    const { location, title } = products[0];
    const query = title.split(' ')[0];
    const results = await searchProducts(query, location);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].location).toContain(location.split(',')[0]);
  });
});
