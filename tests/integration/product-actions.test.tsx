import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProductActions from "@/components/ProductActions";
import type { ProductWithSeller, TransactionStatus } from "@/lib/types";

jest.mock("@/lib/clientApi", () => ({
  getCurrentUser: jest.fn(),
  getTransactionStatus: jest.fn(),
  markProductSold: jest.fn(),
  markProductReceived: jest.fn(),
  createProductReview: jest.fn(),
  createSellerReview: jest.fn(),
  createBuyerReview: jest.fn(),
}));

const clientApi = jest.requireMock("@/lib/clientApi");

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

const buyerStatus: TransactionStatus = {
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
  message: "Waiting for seller to mark this product as sold before reviews are enabled.",
};

describe("ProductActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows only buyer acknowledgement for customers and disables reviews", async () => {
    clientApi.getCurrentUser.mockResolvedValue({ id: "buyer-user", sellers: [] });
    clientApi.getTransactionStatus.mockResolvedValue(buyerStatus);

    render(<ProductActions product={product} />);

    expect(await screen.findByText("I Got This Product")).toBeInTheDocument();
    expect(screen.queryByText("Mark as Sold")).not.toBeInTheDocument();
    expect(
      screen.getByText("Reviews are disabled until you are eligible for this transaction."),
    ).toBeInTheDocument();
  });

  it("enables buyer reviews after seller marked sold", async () => {
    clientApi.getCurrentUser.mockResolvedValue({ id: "buyer-user", sellers: [] });
    clientApi.getTransactionStatus.mockResolvedValue({
      ...buyerStatus,
      sellerMarkedSold: true,
      canBuyerReviewSeller: true,
      canBuyerReviewProduct: true,
      message:
        "The seller marked this product as sold. If you bought this item, please confirm and leave a review.",
    });
    clientApi.createSellerReview.mockResolvedValue({ id: "review-1" });

    render(<ProductActions product={product} />);

    const reviewSellerButton = await screen.findByText("Review seller");
    expect(reviewSellerButton).not.toBeDisabled();
    fireEvent.click(reviewSellerButton);

    await waitFor(() => {
      expect(clientApi.createSellerReview).toHaveBeenCalledWith(
        expect.objectContaining({ productId: "product-1", sellerId: "seller-1" }),
      );
    });
  });

  it("shows only seller sold action and buyer review messaging for sellers", async () => {
    clientApi.getCurrentUser.mockResolvedValue({
      id: "seller-user",
      sellers: [{ id: "seller-1" }],
    });
    clientApi.getTransactionStatus.mockResolvedValue({
      ...buyerStatus,
      isSellerOwner: true,
      canMarkSold: true,
      canMarkReceived: false,
      message:
        "Waiting for buyer to confirm they received this product before buyer review is enabled.",
    });

    render(<ProductActions product={product} />);

    expect(await screen.findByText("Mark as Sold")).toBeInTheDocument();
    expect(screen.queryByText("I Got This Product")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Buyer review is disabled until the buyer confirms they received this product.",
      ),
    ).toBeInTheDocument();
  });
});
