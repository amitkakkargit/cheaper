import { getAllProducts, getProductById, getSellerById, searchProducts } from "@/lib/api";

const seller = {
  id: "s1",
  name: "Demo Seller",
  location: "Bengaluru",
  bio: "Local seller",
  avatarUrl: "",
  reviews: [{ id: "sr1", userId: "u1", sellerId: "s1", rating: 4, comment: "Good" }],
};

const product = {
  id: "p1",
  sellerId: "s1",
  name: "Demo phone",
  title: "Demo phone",
  description: "A useful phone",
  imageUrl: "https://example.com/image.jpg",
  images: [],
  videoUrl: "",
  videoStory: "",
  currentPrice: 100,
  previousPrice: 150,
  discountPercentage: 33,
  condition: "Used",
  location: "Bengaluru",
  category: "Electronics",
  latitude: 12.9,
  longitude: 77.5,
  seller,
  reviews: [{ id: "pr1", userId: "u1", productId: "p1", rating: 5, comment: "Great" }],
};

const jsonResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: async () => body,
  }) as Response;

describe("backend api service", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/products") || url.includes("/products?")) {
        return jsonResponse([product]);
      }

      if (url.endsWith("/products/p1")) {
        return jsonResponse(product);
      }

      if (url.endsWith("/sellers/s1")) {
        return jsonResponse(seller);
      }

      if (url.endsWith("/seller-reviews/s1")) {
        return jsonResponse(seller.reviews);
      }

      if (url.endsWith("/product-reviews/p1")) {
        return jsonResponse(product.reviews);
      }

      return jsonResponse({ message: "Not found" }, false, 404);
    }) as jest.Mock;
  });

  it("returns a full product list enriched with seller data", async () => {
    const products = await getAllProducts();
    expect(products).toHaveLength(1);
    expect(products[0]).toHaveProperty("sellerName", "Demo Seller");
    expect(products[0]).toHaveProperty("productRatingAverage", 5);
  });

  it("finds a product by id", async () => {
    const found = await getProductById("p1");
    expect(found?.id).toBe("p1");
  });

  it("returns a seller by id", async () => {
    const found = await getSellerById("s1");
    expect(found?.id).toBe("s1");
  });

  it("filters products through query parameters", async () => {
    const results = await searchProducts("phone", "Bengaluru");
    expect(results).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/products?search=phone&location=Bengaluru"),
      expect.any(Object),
    );
  });
});
