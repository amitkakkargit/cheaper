"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest, getCurrentUser, type CurrentUser } from "@/lib/clientApi";
import type { ProductWithSeller } from "@/lib/types";
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
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const isSellerOwner = useMemo(
    () =>
      Boolean(user?.sellers?.some((seller) => seller.id === product.sellerId)),
    [product.sellerId, user?.sellers],
  );

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      setNotification({ type: "success", message: success });
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Request failed",
      });
    }
  };

  return (
    <section className="info-card">
      <h2>Manual handoff</h2>
      <p className="muted-text">
        Reviews unlock only after the buyer confirms they got the product and
        the seller confirms it was sold.
      </p>
      {!user ? (
        <p className="status-text">
          Sign in with phone on the home page to confirm handoff or leave
          reviews.
        </p>
      ) : null}
      <div className="header-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={!user || isSellerOwner}
          onClick={() =>
            run(
              () =>
                apiRequest("/products/confirm-bought", {
                  method: "POST",
                  body: JSON.stringify({ productId: product.id }),
                }),
              "Buyer confirmation saved.",
            )
          }
        >
          I got this product
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={!user || !isSellerOwner}
          onClick={() =>
            run(
              () =>
                apiRequest("/products/confirm-sold", {
                  method: "POST",
                  body: JSON.stringify({ productId: product.id }),
                }),
              "Seller confirmation saved.",
            )
          }
        >
          I sold this product
        </button>
      </div>
      {user && !isSellerOwner ? (
        <>
          <div className="field-row">
            <label className="field-label">
              Rating
              <RatingStars
                rating={rating}
                label={`Rate this product ${rating} out of 5`}
                interactive={true}
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
              onClick={() =>
                run(
                  () =>
                    apiRequest("/product-reviews", {
                      method: "POST",
                      body: JSON.stringify({
                        productId: product.id,
                        sellerId: product.sellerId,
                        rating,
                        comment,
                      }),
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
              onClick={() =>
                run(
                  () =>
                    apiRequest("/seller-reviews", {
                      method: "POST",
                      body: JSON.stringify({
                        sellerId: product.sellerId,
                        productId: product.id,
                        rating,
                        comment,
                      }),
                    }),
                  "Seller review submitted.",
                )
              }
            >
              Review seller
            </button>
          </div>
        </>
      ) : null}
      {user && isSellerOwner ? (
        <p className="status-text">
          Sellers can confirm the sale, but cannot review their own product or
          seller profile.
        </p>
      ) : null}
      <FormNotification notification={notification} />
    </section>
  );
}
