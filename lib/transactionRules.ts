import type { CurrentUser } from "@/lib/clientApi";
import type { ProductWithSeller, TransactionStatus } from "@/lib/types";

export function canSellerMarkSold(status: TransactionStatus) {
  return status.canMarkSold;
}

export function canBuyerMarkReceived(status: TransactionStatus) {
  return status.canMarkReceived;
}

export function canBuyerReviewSeller(status: TransactionStatus) {
  return status.canBuyerReviewSeller;
}

export function canSellerReviewBuyer(status: TransactionStatus) {
  return status.canSellerReviewBuyer;
}

export function getTransactionStatusMessage(status: TransactionStatus) {
  return status.message;
}

export function buildFallbackTransactionStatus(
  product: ProductWithSeller,
  user: CurrentUser | null,
): TransactionStatus {
  const isSellerOwner = Boolean(
    user?.sellers?.some((seller) => seller.id === product.sellerId),
  );
  const sellerMarkedSold = Boolean(product.sellerMarkedSoldAt);

  return {
    productId: product.id,
    isSellerOwner,
    sellerMarkedSold,
    sellerMarkedSoldAt: product.sellerMarkedSoldAt ?? null,
    buyerConfirmed: false,
    buyerConfirmedAt: null,
    buyerIdForSellerReview: null,
    canMarkSold: Boolean(user && isSellerOwner && !sellerMarkedSold),
    canMarkReceived: Boolean(user && !isSellerOwner),
    canBuyerReviewSeller: Boolean(user && !isSellerOwner && sellerMarkedSold),
    canBuyerReviewProduct: Boolean(user && !isSellerOwner && sellerMarkedSold),
    canSellerReviewBuyer: false,
    message: isSellerOwner
      ? "Waiting for buyer to confirm they received this product before buyer review is enabled."
      : sellerMarkedSold
        ? "The seller marked this product as sold. If you bought this item, please confirm and leave a review."
        : "Waiting for seller to mark this product as sold before reviews are enabled.",
  };
}
