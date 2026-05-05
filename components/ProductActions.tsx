"use client";

import { useEffect, useState } from "react";
import {
  createBuyerReview,
  createProductReview,
  createSellerReview,
  getCurrentUser,
  getTransactionStatus,
  markProductReceived,
  markProductSold,
  type CurrentUser,
} from "@/lib/clientApi";
import type { ProductWithSeller, TransactionStatus } from "@/lib/types";
import {
  buildFallbackTransactionStatus,
  canBuyerMarkReceived,
  canBuyerReviewSeller,
  canSellerMarkSold,
  canSellerReviewBuyer,
  getTransactionStatusMessage,
} from "@/lib/transactionRules";
import FormNotification, { type NotificationState } from "./FormNotification";
import RatingStars from "@/components/RatingStars";

interface ProductActionsProps {
  product: ProductWithSeller;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [notification, setNotification] = useState<NotificationState>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState(
    "Bought locally and confirmed in person.",
  );
  const [buyerReviewComment, setBuyerReviewComment] = useState(
    "Smooth local handoff and confirmed receipt.",
  );
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = async (currentUser: CurrentUser | null) => {
    if (!currentUser) {
      setStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setStatus(await getTransactionStatus(product.id));
    } catch {
      setStatus(buildFallbackTransactionStatus(product, currentUser));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then(async (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);
      await loadStatus(currentUser);
    });

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      setNotification({ type: "success", message: success });
      await loadStatus(user);
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Request failed",
      });
    }
  };

  const buyerReviewEnabled = status ? canBuyerReviewSeller(status) : false;
  const sellerReviewEnabled = status ? canSellerReviewBuyer(status) : false;

  return (
    <section className="info-card" aria-labelledby="handoff-heading">
      <h2 id="handoff-heading">Manual handoff</h2>
      <p className="muted-text">
        Reviews unlock only after the transaction is acknowledged by the seller
        or buyer according to the marketplace rules.
      </p>
      {!user ? (
        <p className="status-text">
          Sign in to confirm product handoff or leave transaction reviews.
        </p>
      ) : null}
      {user && status ? (
        <p className="status-text" role="status">
          {getTransactionStatusMessage(status)}
        </p>
      ) : null}
      {isLoading && user ? (
        <p className="status-text">Checking transaction status...</p>
      ) : null}

      {status?.isSellerOwner ? (
        <div className="header-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={!canSellerMarkSold(status)}
            onClick={() =>
              run(
                () => markProductSold(product.id),
                "Product marked as sold.",
              )
            }
          >
            Mark as Sold
          </button>
        </div>
      ) : null}

      {user && status && !status.isSellerOwner ? (
        <div className="header-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={!canBuyerMarkReceived(status)}
            onClick={() =>
              run(
                () => markProductReceived(product.id),
                "Product receipt confirmed.",
              )
            }
          >
            I Got This Product
          </button>
        </div>
      ) : null}

      {user && status && !status.isSellerOwner ? (
        <fieldset className="marketplace-form" disabled={!buyerReviewEnabled}>
          <legend>Review this transaction</legend>
          {!buyerReviewEnabled ? (
            <p className="status-text">
              Reviews are disabled until you are eligible for this transaction.
            </p>
          ) : null}
          <div className="field-row">
            <label className="field-label">
              Rating
              <RatingStars
                rating={rating}
                label={`Rate this transaction ${rating} out of 5`}
                interactive={buyerReviewEnabled}
                onRatingChange={setRating}
              />
            </label>
            <label className="field-label">
              Review
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </label>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="primary-button"
              disabled={!buyerReviewEnabled}
              onClick={() =>
                run(
                  () =>
                    createProductReview({
                      productId: product.id,
                      sellerId: product.sellerId,
                      rating,
                      comment,
                    }),
                  "Product review submitted.",
                )
              }
            >
              Review product
            </button>
            <button
              type="button"
              className="primary-button"
              disabled={!buyerReviewEnabled}
              onClick={() =>
                run(
                  () =>
                    createSellerReview({
                      sellerId: product.sellerId,
                      productId: product.id,
                      rating,
                      comment,
                    }),
                  "Seller review submitted.",
                )
              }
            >
              Review seller
            </button>
          </div>
        </fieldset>
      ) : null}

      {user && status?.isSellerOwner ? (
        <fieldset className="marketplace-form" disabled={!sellerReviewEnabled}>
          <legend>Review the buyer</legend>
          {!sellerReviewEnabled ? (
            <p className="status-text">
              Buyer review is disabled until the buyer confirms they received
              this product.
            </p>
          ) : null}
          <div className="field-row">
            <label className="field-label">
              Rating
              <RatingStars
                rating={rating}
                label={`Rate this buyer ${rating} out of 5`}
                interactive={sellerReviewEnabled}
                onRatingChange={setRating}
              />
            </label>
            <label className="field-label">
              Review
              <input
                value={buyerReviewComment}
                onChange={(event) => setBuyerReviewComment(event.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            className="primary-button"
            disabled={!sellerReviewEnabled || !status.buyerIdForSellerReview}
            onClick={() =>
              run(
                () =>
                  createBuyerReview({
                    productId: product.id,
                    buyerId: status.buyerIdForSellerReview ?? "",
                    rating,
                    comment: buyerReviewComment,
                  }),
                "Buyer review submitted.",
              )
            }
          >
            Review buyer
          </button>
        </fieldset>
      ) : null}

      <FormNotification notification={notification} />
    </section>
  );
}
