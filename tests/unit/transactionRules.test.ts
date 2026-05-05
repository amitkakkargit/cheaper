import {
  buildFallbackTransactionStatus,
  canBuyerMarkReceived,
  canBuyerReviewSeller,
  canSellerMarkSold,
  canSellerReviewBuyer,
} from "@/lib/transactionRules";
import type { CurrentUser } from "@/lib/clientApi";
import type { ProductWithSeller, TransactionStatus } from "@/lib/types";

const baseStatus: TransactionStatus = {
  productId: "product-1",
  isSellerOwner: false,
  sellerMarkedSold: false,
  sellerMarkedSoldAt: null,
  buyerConfirmed: false,
  buyerConfirmedAt: null,
  buyerIdForSellerReview: null,
  canMarkSold: false,
  canMarkReceived: true,
  canBuyerReviewSeller: false,
  canBuyerReviewProduct: false,
  canSellerReviewBuyer: false,
  message: "Waiting",
};

const product = {
  id: "product-1",
  sellerId: "seller-1",
  title: "Used phone",
  description: "Good phone",
  imageUrl: "",
  images: [],
  videoUrl: "",
  videoStory: "",
  currentPrice: 100,
  previousPrice: 150,
  discountPercentage: 33,
  condition: "Used",
  location: "Bengaluru",
  category: "Electronics",
  sellerName: "Local seller",
  sellerLocation: "Bengaluru",
  sellerAvatarUrl: "",
  productRatingCount: 0,
  productRatingAverage: 0,
  sellerRatingCount: 0,
  sellerRatingAverage: 0,
} satisfies ProductWithSeller;

describe("transaction rules", () => {
  it("identifies seller mark sold eligibility", () => {
    expect(
      canSellerMarkSold({
        ...baseStatus,
        isSellerOwner: true,
        canMarkSold: true,
      }),
    ).toBe(true);
  });

  it("identifies buyer received eligibility", () => {
    expect(canBuyerMarkReceived(baseStatus)).toBe(true);
  });

  it("enables buyer review when seller marked sold", () => {
    expect(
      canBuyerReviewSeller({
        ...baseStatus,
        sellerMarkedSold: true,
        canBuyerReviewSeller: true,
      }),
    ).toBe(true);
  });

  it("enables seller review only when buyer confirmed receipt", () => {
    expect(
      canSellerReviewBuyer({
        ...baseStatus,
        isSellerOwner: true,
        buyerConfirmed: true,
        canSellerReviewBuyer: true,
      }),
    ).toBe(true);
  });

  it("builds a seller fallback status without enabling buyer review", () => {
    const sellerUser: CurrentUser = {
      id: "seller-user",
      sellers: [{ id: "seller-1" }],
    };

    const fallback = buildFallbackTransactionStatus(product, sellerUser);

    expect(fallback.isSellerOwner).toBe(true);
    expect(fallback.canMarkSold).toBe(true);
    expect(fallback.canSellerReviewBuyer).toBe(false);
  });
});
